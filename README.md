[![forthebadge](./readme-assets/html5-badge.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-css.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![forthebadge](./readme-assets/uses-jest.svg)](https://forthebadge.com)

<br/>

<div id="header" align="left">
  <img src="./readme-assets/billed-logo.png" width="200"/>
</div>

# Project Billed

Billed is a company that produces Saas solutions for human resources teams.
For this project, frontend code application is given with some issues.
The API backend given has allowed me to implement and perform tests by using Jest in order to identify and resolve frontend code issues reported.

# Technologies :

1. HTML5
2. CSS3
3. Javascript
4. Jest

# INSTALLATION :

- Clone this repository

## BACKEND INSTALLATION

- Navigate to the backend folder by using command :

```
cd Billed-app-FR-Back
```

- Install backend dependancies :

```
npm install
```

- Run API :

```
npm run run:dev
```

API is accessible on PORT : `5678` (`http://localhost:5678`).

- User and Admin logins by default :

```
identifiant : employee@test.tld
password : employee
```

```
identifiant : admin@test.tld
password : admin
```

## FRONTEND INSTALLATION

- Navigate to the frontend folder by using command :

```
cd Billed-app-FR-Front
```

- Install frontend dependancies :

```
npm install
```

- If not installed, install live-server :

```
 npm install -g live-server
```

- Run frontend :

```
live-server
```

Frontend is accessible on PORT : `8080` (`http://127.0.0.1:8080/`).

- User and Admin logins by default :

```
identifiant : employee@test.tld
password : employee
```

```
identifiant : admin@test.tld
password : admin
```

## RUN ALL JEST TESTS

```
npm run test
```

## RUN ONE JEST TEST

- Install jest-cli :

```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## JEST COVERAGE

`http://127.0.0.1:8080/coverage/lcov-report/`
