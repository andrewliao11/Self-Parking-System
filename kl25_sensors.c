#include <stio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <termios.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <stdbool.h>
#include <limits.h>
#include <sys/select.h>
#include <math.h>

#define PI 3.14159265
#define BUFLEN 256
#define DEBUG

const double acc_z_abs_max = 4000.0;

inline double trunc_norm (double val, const double abs_max) {
	if (-abs_max>val || val>abs_max) val = val>0 ? abs_max : -abs_max;
	return val / abs_max;
}

int openserial (char *sdevfile) {
	int _serial_d = open(sdevfile, O_RDWR | O_NOCTTY);
	if (_serial_d == -1) perror("Unable to open device\n");
	return _serial_d;
}

int main (int argc, char **argv) {
	int i;
	int serial_d;
	speed_t speed;
	struct termios soptions, soptions_org;;
	unsigned char sensor_index = 0+'0'; // indexes are ASCII-based
	char wCommand;
	unsigned char send_buf[BUFLEN];
	unsigned char recv_buf[BUFLEN];
	int acc_x, acc_y, acc_z;
	int data_x, data_y, data_z;
	float data_TSI, theta;
	unsigned int num_recv_c, num_send_c;
	unsigned int timecycle = 0;
	FILE *xdata_fp;
	int file_index = 0; // file extensions: .1, .2,...
	const int sample = 10; // output file will contain 1*sample points
	const char *filebase = "xdata.";
	const int num_file = 2;
	char filename[BUFLEN];

	// no port specified
	if (argc == 1) {
		printf("Usage: zstar3-test sensor_index port: \"zstar3-test 0 /dev/ttyACM0\"\n");
		printf("\"sensor_index\" is used to select sensors if multiple sensors are detected by USB transceiver.\n");
		printf("\"/dev/ttyACM0\" is a USB serial device (cdc_acm kernel module) to support serial control to modems.\n");
		return 1;
	}

	sensor_index = argv[1][0]; // 0~15(F)

	if ((serial_d = openserial(argv[2])) == -1) return 1;

	// ----- Begin of setup serial ports
	tcgetattr(serial_d, &soptions_org);
	tcgetattr(serial_d, &soptions);
	speed = B115200; // Speed options: B19200, B38400, B57600, B115200
	cfsetispeed(&soptions, speed);
	cfsetospeed(&soptions, speed);
	// Enable the reciver and set local mode...
	soptions.c_cflag |= ( CLOCAL | CREAD );
	// Setting Parity Checking (8N1)
	soptions.c_cflag &= ~PARENB;
	soptions.c_cflag &= ~CSTOPB;
	soptions.c_cflag &= ~CSIZE;
	soptions.c_cflag |= CS8;
	// Local setting
	// soptions.c_lflag = (ICANON | ECHO | ECHOE); // canonical
	soptions.c_lflag =  ~(ICANON | ECHO | ECHOE | ISIG); // noncanonical
	// Input setting
	// soptions.c_iflag |= (IXON | IXOFF | IXANY); // software flow control
	soptions.c_iflag |= (INPCK | ISTRIP);
	soptions.c_iflag = IGNPAR;
	// Output setting
	soptions.c_oflag = 0;
	soptions.c_oflag &= ~OPOST;
	// Read options
	soptions.c_cc[VTIME] = 0;
	soptions.c_cc[VMIN] = 1; // transfer at least 1 character or block
	// Apply setting
	tcsetattr(serial_d, TCSANOW, &soptions);
	// ----- End of setup serial ports

	memset(recv_buf, '\0', BUFLEN);
	tcflush(serial_d, TCIOFLUSH);
	usleep(10000);

	printf("Start Measuring...\n");
	while (1) {
		sprintf(filename, "%s%d\0", filebase, file_index);
		if (xdata_fp = fopen(filename, "w")) {
			fprintf(xdata_fp, "{\"time\":%d,\n\"xarray\":[\n", timecycle);
			for (i=0; i<sample; i++) {
				wCommand = 'V';
				num_send_c = write(serial_d, &wCommand, 1);
				tcdrain(serial_d);

				memset(recv_buf, '\0', BUFLEN); // receive data: Wait for 3-axis ready
				num_recv_c = read(serial_d, &recv_buf[0], BUFLEN);
				tcdrain(serial_d);

				sscanf(recv_buf, " %d %d %d %f,", &data_x, &data_y, &data_z, &data_TSI);
				acc_x = data_x;
				acc_y = data_y;
				acc_z = data_z;
				theta =  acos(trunc_norm(acc_z, acc_z_abs_max)) * 180 / PI;

				#ifdef DEBUG
				printf("X command receive: (%d %d %d %f %f) t=%d\n", data_x, data_y, data_z, theta, data_TSI, timecycle);
				#endif

				if (i != sample-1) {
					fprintf(xdata_fp, "[%d, %d, %d],\n", acc_x, acc_y, acc_z);
				} else { // Last sample does not need a trailing comma for JSON format
					fprintf(xdata_fp, "[%d, %d, %d] \n", acc_x, acc_y, acc_z);
				}

				//usleep(8000);
				usleep(4000);
			}
			// Write postscript to file
			fprintf(xdata_fp, "]\n}\n");
			fclose(xdata_fp);
		} else {
			printf("Can not open \"%s\"", filename);
		}
		file_index = (file_index+1) % num_file; // cycle to next file index
		timecycle++; // time counter
	}

	wCommand = 'x'; //Send 'x' to stop burst mode
	num_send_c = write(serial_d, &wCommand, 1);
	tcdrain(serial_d);
	memset(recv_buf, '\0', BUFLEN);
	num_recv_c = read(serial_d, recv_buf, 1);
	tcdrain(serial_d);
	// restore setting and close
	tcsetattr(serial_d, TCSANOW, &soptions_org);
	close(serial_d);

	return 0;
}
