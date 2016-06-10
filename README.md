# Self Parking System
Implement self-parking system on website. All code are written in Javascript.
## Concept
Nowadays, self-driving is a red hot topic in machine learning and computer vision. Here I implement an algorithm to park the car autimatically(backward/forward parking).

## 5 different modes
1. Keyboard   
    Use keyboard to control the car.
2. Shortest   
    Go the shortest way(directly drive to the parking spot, ignoring the obstacles)
3. Forward   
    Forward parking and escape the stationary obstacles
4. Backward   
    Backward parking and escape the stationary obstacles
5. Accelerometer   
    Use accelerometer connected with Nitrogen6x to control the car.

## How to implement?
1. Manual   
Use keypress handler/ to detect whether there is any key being pressed.
```
function keypress_handler(event){
    if (mode=="Keyboard"){
        console.log(event.keyCode);
        if(event.keyCode == 87) mod = 1;
        if(event.keyCode == 83) mod = -1;
        if(event.keyCode == 65) angle -= 2;
        if(event.keyCode == 68) angle+=2;
    }
}
```
2. Shortest   
Using the if-else like the following snippet to control the car direction. dist_x and dist_y denote the distance between the car and the parking spot, respectively.
```
if (dist_x>0 && dist_y>0){
    if (angle<desired_angle && angle>(desired_angle-180))   angle += 2;
    else    angle -= 2;
}
```
3. Forward/Backward parking   
The follow snippet is the pseudocode of the algorithm, using if-else, similar to the previous algo.
```
if (distance is far away)
    go directly and do the backward/forward parking
else
    do the backward/forward parking
```
**Here is the illustration of the above alogorithms(2,3):**   
![](https://github.com/andrewliao11/ee240500/blob/master/illustration.png?raw=true)   
4. Accelerometer   
The key of using accelerometer is to access the data from it. I modify the kl25_sensors.c to output the data from the acceleromete, and use it to control the car in the way similar to keyboard handler.   

## Additional: recording path on the screen 
Record the path on the screen, and flush whenever the change mode
![](https://github.com/andrewliao11/ee240500/blob/master/record_path.png?raw=true)
## Demo video
[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/_JEWey38MZ0/0.jpg)](https://www.youtube.com/watch?v=_JEWey38MZ0)
