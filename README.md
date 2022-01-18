# BallSortPuzzleSolver
An algorithm that tries to solve the puzzle as efficiently as possible

Ball Sort Puzzle:
- You have (m) tubes, each with max a capacity (n)
- You have balls of different colors, each color appears (n) times
- The balls are distributed randomly among tubes
- GOAL: sort the balls so, that each tube only contains balls of a single color (all (n) of them)
- You can only pick the top ball from a tube and move it to a tube that is not already full
- GOAL 2: Reach Goal 1 in the least moves possible

ABOUT THE CODE:
- This is my first Javascript project that uses object-oriented style
- A lot of emphasis is placed on readability and short code (eg. tube.balls.length -> tube.n())
- I try to avoid boilerplate code and use pre-existing methods as much as possible (eg. array.foreach())

The current algorithm solves the puzzle in attached image (but with one free tube) in:
- 49 moves
- 7071 loops (ignores printing)
- 27 recursive calls
- 380 lines of code

NOTE! There are also variations of the basic rules that I outlined above. For example, there could be (x * n) balls of the same color, in which case more than one tube would beed to be filled with that color. Or there could be any number of same-colored balls, and the only goal is to separate them from other colors. Also, apparenlty, the official rule of this puzzle states that you can only move a ball on top of a same-colored ball (& if the tube has free space). I learned this late, which is why this rule is not implemented in my solver.



--- Change history ---

2022.1.18: The solver now saves a move sequence, so that it can be compared to other solvers' move sequences
