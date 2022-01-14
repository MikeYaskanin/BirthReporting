# BFDR Data Collection

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

To run the BFDR Data Collection webapp, the following are required:

- NodeJS/npm must be installed [for download, visit https://nodejs.org)
- Create and account & Register a Provider application for development with Cerner [here](https://code.cerner.com/developer/smart-on-fhir/apps)

### Cerner Application Registration

Creating an account and registering an application with Cerner is a multi-step process. First an account must be created & approved by Cerner, then an application must be registered and again approved before it can be tested. [This site](https://code.cerner.com/developer/smart-on-fhir/apps) is where you can register, view & configure applications with Cerner.

When configuring an application with Cerner, the application must be registered as a **Provider** application, and the following scopes must be included:

#### Standard Scopes:
- `launch`
- `profile`
- `fhirUser`
- `openid`
- `online_access`

#### User Scopes:
- `user/Condition.read`
- `user/Coverage.read`
- `user/Observation.read`
- `user/Patient.read`
- `user/Practitioner.read`
- `user/Procedure.read`
- `user/RelatedPerson.read`

## Local Development

To install dependencies (needed only once for a new build environment, and then after changing the dependencies):

### `npm install`

To run the project locally, in the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
