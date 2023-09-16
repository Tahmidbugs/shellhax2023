"""
GitHubUser.path : carries the path built till that node  

prevpath: GitHubUser[] -> temporary variable which is assigned the path property from the parent node object and then added the current node to keep building the path.

"""
import requests
import queue
import os
import json
from dotenv import load_dotenv

load_dotenv()


class GitHubUser:
    def __init__(self, login, id, avatar_url, url, name, company,
                 location, email, bio,followers, layer):
        self.login = login
        self.id = id
        self.avatar_url = avatar_url
        self.url = url
        self.name = name
        self.company = company
        self.location = location
        self.email = email
        self.bio = bio
        self.followers = followers
        self.layer = layer
        self.path=[]

    def __str__(self):
        return f"GitHub User: {self.login}"

    def __repr__(self):
        return f"{self.login}"


class GitHubUserEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, GitHubUser):
            obj_dict = obj.__dict__.copy()
            del obj_dict['path']  # Removes circular reference when writing to json
            return obj_dict
        return super().default(obj)






def func(username,token):
    # Send a GET request to an API endpoint
    headers={
        'Authorization': 'token ' + token   #token from logged in user
    }
    companypaths=[] #to provide all the paths leading to a company person
    adjmap = dict()
    count = 0

    userjson = requests.get(
        'https://api.github.com/users/' + username, headers=headers)
    count += 1

    # Check if the request was successful (HTTP status code 200)
    if userjson.status_code == 200:
        userdata = userjson.json()
        depth = 2
        user = GitHubUser(layer=0, **{k: userdata[k] for k in ['login', 'id', 'avatar_url', 'url', 'name', 'company', 'location', 'email','bio', 'followers']})
        user.path.append(user)
        q = queue.Queue()
        q.put(user)
        for i in range(1, depth+1):
            size = q.qsize()  
            x = 0
            while x < size:     
                currUser = q.get()  #removes and returns element
                if currUser.followers > 0:
                    valuearray = []  #holds all the User references that are directly connected to the user as well as it self
                    valuearray.append(currUser)
                    adjmap[currUser.login] = valuearray
                    followersjson = requests.get(
                        'https://api.github.com/users/'+currUser.login+'/followers', headers=headers)
                    count += 1
                    followers = followersjson.json()
                    for index, newUserpartialData in enumerate(followers):
                        if index > 9:   #take max  10 followers
                            break
                        if(newUserpartialData['login'] in adjmap):  #if same user appears again, take already stored info
                            oldUser=adjmap[newUserpartialData['login']][0]
                            adjmap[currUser.login].append(oldUser) 
                            continue
                        #if new user, have to fetch for data
                        newUserDataJson = requests.get(
                            'https://api.github.com/users/'+newUserpartialData['login'], headers=headers)
                        count += 1
                        newUserData = newUserDataJson.json()
                        newUser = GitHubUser(layer=i, **{k: newUserData[k] for k in ['login', 'id','avatar_url', 'url', 'name', 'company', 'location', 'email', 'bio', 'followers']})
                        if newUser.login not in adjmap:
                            prevpath = list(currUser.path)    #update before pushing to queue
                            prevpath.append(newUser)
                            newUser.path = prevpath
                            if newUser.company is not None:
                                 companypaths.append(prevpath)
                            q.put(newUser)  # put to the queue if not processes
                            adjmap[currUser.login].append(newUser)
                        
                x += 1
    else:
        # Print the error message
        print("Error:", userjson.text)
        return userjson

     # Write the map to a file
    data = {
        "adjmap": adjmap,
        "companypaths": companypaths
    }

    json_data = json.dumps(data, cls=GitHubUserEncoder)

    print(count)
    return json_data