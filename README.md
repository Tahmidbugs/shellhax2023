# Backend

## Instructions
1. Use ```git clone https://github.com/Tahmidbugs/shellhax2023.git .``` or click download zip to download the repository to your local system.
2. After the code is downloaded into your local machine, move into the server folder and run ```.venv\Scripts\activate``` for Windows or ``` source .venv/bin/activate``` for macOS/Linux to activate the virtual environment.
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


![image](https://github.com/Tahmidbugs/shellhax2023/assets/87687164/5248d239-4956-489e-81be-fd1fe6de37b3)


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


# Frontend

# GitConnected-Frontend

![WhatsApp Image 2023-09-17 at 10 56 06](https://github.com/Tahmidbugs/shellhax2023/assets/87687164/163a9190-c84f-42f0-8660-113454781431)

## What does it do?
This web application is your all-in-one place to get started with getting referrals. You will be surprised to find people so close to you who you can reach out
to for referrals and be more likely to get one. We find a curated list of individuals whom you might have not thought of finding at a place where every developer is - Github.
Not only do we connect, but we take you one step further by crafting personalized emails(to be made!) and elevator pitches using the state-of-the-art AI tool OpenAI Apu. Try it out!

https://devpost.com/software/gitconnected?ref_content=my-projects-tab&ref_feature=my_projects


## How it works?
We have talked in depth about the entire implementation of how it does what it does in the backend part.


## Tech Stack?
We used <code>React.js</code> for the front end. The library that we used to build the visualization part is called <code>React Sigma</code>. 
The entire code base is written in <code>Typescript + Javascript</code>. We use <code>Firebase</code> as well as <code>Flask web framework</code> for the backend. We also used <code>OpenAI</code> API.

## Authentication
We used Github Oauth for authentication. This served two purposes.
1. Made authenticated requests to GitHub API.
2. Provided an access token from each user that we could use to make API calls. Thus, preventing a single source IP call from exceeding the API limit.



## Instructions

1. After the code is downloaded into your local machine from the previous clone of the repo, move to the client folder and run ``` npm install ``` in your CMP/terminal.
2. After the installation is complete, run the command ``` npm run ```.
Note: You might need to install Node on your local machine if it's already not installed.

## Problems we ran into

Doing this project was very straightforward in terms of the overall project layout. However, the biggest problem we ran into was with the GitHub API. While I was testing the Python script to create the graph, we ran into this issue. 

<code>{"message":"API rate limit exceeded for 49.37.45.101. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"}</code> 

Looking into it, I found out that the GitHub API has a limit of 60 API calls/hr for unauthorized requests. This was a big problem for us because we had at least 120 API calls per user. Searching through GitHub's documentation on Rate-Limits, I found a perfect solution for my problem: Github Oauth.
This provided us with an access token that we could use to make API calls for each individual user. This made the API calls authorized, increasing the cap from 60 to 5000 API calls/hr per user. This also helped us prevent a single source IP from exceeding the API limit as seen in the error message, because now we were making calls on behalf of the client and thus making it IP agnostic.

