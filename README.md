# shellhax2023

## Instructions
1. Use ```git clone https://github.com/Tahmidbugs/shellhax2023.git .``` or click download zip to download the repository to your local system.
2. After the code is downloaded into your local machine, move into the root folder and run ```.venv\Scripts\activate``` for Windows or ``` source .venv/bin/activate``` for macOS/Linux to activate the virtual environment.
3. Next, Run ```pip install -r requirements.txt``` to install all dependencies from the requirements.txt file.
4. Finally, run the server in a debugging mode using ```flask --app flaskr run --debug```.

How we created it?
We started by writing a Python script that would make API calls to GitHub's public API and create a graph connecting the user's neighbors.

## Endpoints
We made use of two endpoints: 1. https://api.github.com/users/khan168 2.https://api.github.com/users/khan168/followers

The first endpoint provided the complete current user information but only the number of followers. The second endpoint shows the current user's followers' information but doesn't provide complete info about them thus going back to 1st endpoint again. This forced me to have, 2 API calls/User

## Reason for building the graph
It's very easy to visualize that a graph data structure represents this scenario. Each user has followers and then those followers have their followers and so on. I could just make API calls without building a graph to find a list of neighboring users working at a company, however, I also had to visualize this information which is why I needed to build the graph.

## Building the graph
We used a Breath First Search approach to build the graph from API calls. BFS is a very common graph traversal algorithm that uses a queue to iteratively process the neighboring nodes first. The structure of the graph we used is a Map data structure where the key for me was the username (string) and the value was an array of users' information encapsulated in a class Map<string, User[]>. We started by making the API call to the 1st endpoint to get the root user info and added it to the queue. Due to reasons talked about in the Endpoints paragraph, we made another API call to the 2nd endpoint to get the directly connected users' incomplete info. We then go over these users, making an API call to the 1st endpoint again for each user, and adding them to the queue. This finishes the 1st level and now the cycle will repeat for the next levels.

![image](https://github.com/Tahmidbugs/shellhax2023/assets/87687164/f0370550-b6e9-4bf4-9ebd-14b899d53e60)


## Building the paths leading to hired Users
Data structure [[ User ]]: An array with each array leading to a hired User.

We implemented this by keeping track of the path till each User inside of that User object in an attribute called path. So, while building the graph in a BFS approach, we have access to the parent whose path property will already have been built. When iteratively reaching the child from the parent, we check to see if it already exists in the graph. If it does, it means that the path attribute would already have been updated inside the object. Otherwise, we take the parent node's path attribute and push the new node.

## Creating an upper bound to the time complexity
We have to realize that we are always computationally restrained and need to have a limit to how much computation we do. However, in our use case, it also made sense logically to have that limit. The algorithm that we wrote only goes up to a limit of a depth of 3. So, what is each level of depth? The farther you go in-depth, the more distant that person is to you and the lesser the chance of that person knowing you at all. After taking suggestions from people, we thought 3-4 depth is a sweet spot where the person is more likely to know of you if not know you very well and the most chance for you to get a referral. As for the breath-wise stretch, It makes sense to go for more than 10 followers but even going over 10 takes about a run time of 30s(max). We would like to have the app deployed and get some feedback before we change this limit on the breath.

## Time complexity
The time complexity for the algorithm is 10^(depth).  (exponential)

## Errors we ran into
Circular Reference:
ValueError: Circular reference detected- Circular references can occur when an object contains a reference to itself directly or indirectly through nested objects or data structures. We ran into this error when I tried to serialize the graph with a new attribute path in the User class. As we mentioned earlier, this path attribute helps create the array of paths leading to hired Users. The error was caused because each path attribute would have a reference to that object itself. Why push an entire object? We could have it so that we just push their login or some other info to prevent circular reference, and then maybe use the map to fetch the complete information on the front end. I'm sure there are better ways of doing it.

We realized that we didn't need to serialize the path attribute for each User, which was causing the circular reference, once the Array list of Hired users was created. Therefore, we made a custom class encoder to make a shallow copy of the object and remove the path variable key from the object's dictionary representation when serializing it.

obj_dict = obj.dict.copy()
del obj_dict['path']
