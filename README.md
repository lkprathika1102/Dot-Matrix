# 🛰️ DOT-MATRIX

```text
 ____   ___   _____      __  __     _    _____  ____   ___  __  __ 
|  _ \ / _ \ |_   _|    |  \/  |   / \  |_   _ |  _ \ |_ _| \ \/ / 
| | | | | | |  | |      | |\/| |  / _ \   | |  | |_) | | |   \  /  
| |_| | |_| |  | |      | |  | | / ___ \  | |  |  _ <  | |   /  \  
|____/ \___/   |_|      |_|  |_|/_/   \_\ |_|  |_| \_\ | |  /_/\_\

```
Dot Matrix is built with vanilla JavaScript and HTML5 Canvas.
It's an infinite, browser-based drawing tool where you create intricate, network-like art by placing dots on a canvas. When dots get close to each other, they automatically connect with lines, allowing you to design complex geometric shapes and structures that go on forever in any direction.

## Tech Stack
- Vanilla JavaScript
- HTML5 Canvas
- CSS3
- Math: Linear Algebra

## How to run??
Just try out the link [here](https://lkprathika1102.github.io/Dot-Matrix/)

## Control Interface

| Action | Input | Result |
| :--- | :--- | :--- |
| **Deploy Node** | Left Click / Hold | Places nodes in canvas |
| **Navigate** | Right Click + Drag | Pans across the infinite canvas |
| **Scale** | Mouse Wheel | Zooms in/out centered on cursor |
| **Undo/Redo** | UI Buttons | Reverts/Restores node states |
| **Reset** | Erase Button | Wipes all user-created nodes |
| **Export** | Save PNG | Renders a high-res crop of the design |

## What did I learn?
more advanced css and the coordinate systems and the mathematics used
(Instead of moving the canvas, I transform world coordinates into screen coordinates using (world * zoom) + offset.)

## Challenges Faced
This is my first project fo Hack Club, so it was kind of altogether a different experience, i faced troubles with the math part( i am weak in maths) but soon did it with a bit of help from my brother and also managing the node precision was another part

## Theme 
unlike typical digital canvases that have a fixed width and height, DOT MATRIX uses a floating point coordinate system. There is no 0,0 boundary the user can move in any direction for billions of units without ever hitting a wall.hence making it tuly endless in a sense,
also for the auto gen option ,the world is infinitely poulated fitting the theme aptly