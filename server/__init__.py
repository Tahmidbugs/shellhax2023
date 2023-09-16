import os
from flask import Flask,request
from buildgraph import func
from flask_cors import CORS
import requests
import json


app = Flask(__name__)
cors = CORS(app)


# host test
@app.route('/',methods=['GET'])
def Hello():
    return "Hello"

# end point to build and send graph
@app.route('/api/<user>',methods=['POST'])
def getGraph(user):
    token = request.json.get('token')
    return func(user,token)

#end point to get Authentication token for API call
@app.route('/api/auth', methods=['GET'])
def getToken():
    session_code = request.args.get('code')

    params = {
        "client_id": os.getenv("CLIENT_ID"),
        "client_secret": os.getenv("CLIENT_SECRET"),
        "code": session_code
    }
    print(os.getenv("CLIENT_ID"))
    print(os.getenv("CLIENT_SECRET"))
    

    print(params)
    print(session_code)
    url = "https://github.com/login/oauth/access_token"

    headers = {'Accept': 'application/json'}
    response = requests.post(
        'https://github.com/login/oauth/access_token',
        data=params,
        headers=headers)
    print(response)
    if response.ok:
        try:
            data = response.json()
            return data
        except json.JSONDecodeError:
            # Handle the case where the response is not valid JSON
            return "Invalid JSON response"
    else:
        # Handle the case where the request was not successful
        print(response.status_code)
        return "Request failed: " + response.status_code



if __name__ == "__main__":
    app.run()