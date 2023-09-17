import os
from flask import Flask, request
from buildgraph import func
from flask_cors import CORS
import requests
import json

TOKEN = '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'

app = Flask(__name__)
cors = CORS(app)


# host test
@app.route('/', methods=['GET'])
def Hello():
    return "Hello"

# end point to build and send graph


@app.route('/api/<user>', methods=['POST'])
def getGraph(user):
    token = request.json.get('token')
    return func(user, token)

# end point to get Authentication token for API call


@app.route('/api/auth', methods=['GET'])
def getToken():
    session_code = request.args.get('code')

    params = {
        "client_id": os.getenv("CLIENT_ID"),
        "client_secret": os.getenv("CLIENT_SECRET"),
        "code": session_code
    }

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


# RECRUITER END POINTS

# post job details and github usernames
@app.route('/api/recruiter/<user>', methods=['POST'])
def postJob(user):
    print('post job')
    job = request.json.get('job')
    username = request.json.get('username')
    return process_users(user, job, username)


def process_users(user, job, usernames):
    results = []
    for username in usernames:
        results.append(process_user(user))


def process_user(user):
    # get list of repositories for user
    # get list of languages for each repository
    # get list of commits for each repository
    # get list of pull requests for each repository
    # get list of issues for each repository
    # get list of tags for each repository
    # get list of followers for each repository
    # get list of stars for each repository
    # get list of forks for each repository
    # get list of topics for each repository
    results = {}
    results['repositories'] = requests.get(
        'https://api.github.com/users/'+user+'/repos').json()
    for repo in results['repositories']:
        repo['languages'] = requests.get(repo['languages_url']).json()
        repo['commits'] = requests.get(
            repo['commits_url'].split('{')[0]).json()
        repo['pulls'] = requests.get(repo['pulls_url'].split('{')[0]).json()
        repo['issues'] = requests.get(repo['issues_url'].split('{')[0]).json()
        repo['tags'] = requests.get(repo['tags_url']).json()
        repo['followers'] = requests.get(repo['stargazers_url']).json()
        repo['stars'] = requests.get(repo['stargazers_url']).json()
        repo['forks'] = requests.get(repo['forks_url']).json()
        repo['topics'] = requests.get(repo['topics_url']).json()
    return results


if __name__ == "__main__":
    app.run()
