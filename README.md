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

### Making changes

Once you have made your changes, commit to your fork and then you can go and make a pull request back to the main repository. Once you have done this, I will review your changes and then merge them into the main repository if the changes are good. For more information about making pull requests, check on [GitHub's Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

## Issues

If you find any issues with the project, please create an issue on the repository and I will look into it as soon as possible. For more information about creating issues, check on [GitHub's Docs](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-issues).

<!-- ## API Documentation

### GET /

Redirects to muusik.app

### GET /find-user

Finds the user's voice channel

#### Query Parameters

| Name     | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| user     | Snowflake | The ID of the user                                                          |

### POST /play

Plays a song in the user's voice channel

#### Body Parameters

| Name     | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| url      | String    | The URL of the song                                                         |
| user     | Snowflake | The ID of the user                                                          |

### GET /auth/:type

Authenticates the user with the `:type` provided

#### Types

| Name     | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| lastfm   | Authenticates the user with Last.fm                                         |

### GET /find-song

Finds a song on last.fm

#### Query Parameters

| Name     | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| query    | String    | The query to search for                                                     |
| limit    | Number?   | The limit of results to return                                              |

### POST /scrobble

Scrobbles a song to last.fm

#### Body Parameters

| Name     | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| user     | String    | The user secret of the user's last.fm account                               |

### GET /session/:type

Gets the session of the user

#### Types

| Name     | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| lastfm   | Gets the session of the user's Last.fm account                              |

#### Query Parameters

| Name     | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| token    | String    | The user token of the user's last.fm account                                |

### GET /get-roles

Gets the roles of the guild

#### Query Parameters

| Name     | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| guild    | Snowflake | The ID of the guild                                                         |

### GET /check-permissions

Checks the permissions of the user

#### Query Parameters

| Name       | Type      | Description                                                                 |
| ---------- | --------- | --------------------------------------------------------------------------- |
| guild      | Snowflake | The ID of the guild                                                         |
| user       | Snowflake | The ID of the user                                                          |
| permission | Number    | The permission to check for (i.e. admin is 0x8)                             |
 -->
