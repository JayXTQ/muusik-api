# api.muusik.app

This is the API for the muusik.app project. This API will allow you to request and post information to and from our Discord bot which can help muusik.app users listen to music directly from their Discord server.

## What is this built on?

This API is built on Node.JS and Hono.dev (a web framework for APIs). For the Discord bot we are using discord.js and discord-player which does most of the music playing for us.

## Contributing

If you would like to contribute to this project, please read further here on how to do so.

### Getting started

To get started with contributing to this project, you will need to have Node.JS installed on your machine. Install it via the [Node.JS Website](https://nodejs.org).

Once you have Node installed, you will need to fork the repository and clone it to your machine, you can use whatever to clone it. I recommend GitHub Desktop for Windows/MacOS users.

Once you have cloned the repository, you will need to install the dependencies. You can do so by running the following command in your terminal:

```bash
npm install
```

This will then install all the dependencies/libraries needed for this project.

### Running the project

> **Warning:** You will need to rename `.env.example` to `.env` and fill in the values for the environment variables before doing this.

To run the project, you will need to run the following command in your terminal:

```bash
npm run dev
```

This will then run the project and you will be able to access it on your localhost, for instance `http://localhost:8000` (this is default, unless you change the port in `.env`).

### Hosting the project

Hosting the project is more of a personal thing, you can host it locally on a server, or on an off-site cloud server like Heroku. For the original https://api.muusik.app we use Heroku to host the project.

With Heroku hosting, you can just link your GitHub fork to Heroku and then it will automatically deploy the project for you.

You also do not need to host the frontend of the project, you can just host the API then use the main website to access your API. To do this you will need to have the original Muusik bot in your server and you will need to be in a VC. Once you are in a VC, go to the dashboard > settings > and then change the API URL to your API URL. **Note:** You have to be the owner of the server to change these settings.

### Making changes

Once you have made your changes, commit to your fork and then you can go and make a pull request back to the main repository. Once you have done this, I will review your changes and then merge them into the main repository if the changes are good. For more information about making pull requests, check on [GitHub's Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

## Issues

If you find any issues with the project, please create an issue on the repository and I will look into it as soon as possible. For more information about creating issues, check on [GitHub's Docs](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-issues).

