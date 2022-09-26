# BOOK-RESERVATION-APPlLICATION-Typescript

This is the backend for the Books-renting web-application using TypeScript, MongoDB and Dokcer

## Prerequisites

1. Install mongodb
2. Install nodejs
3. Install Docker

## Setting Up

- Create the `.env` file in root directory based on the `.env.dev`
- Run mongoDB on your local machine
- Run locally by Node command `npm run watch` or by Docker

\*\*Note:

- Pay attention on `secret.ts` in src/util folder to modify Secret key relating to MongoDB and Google Login

## Feature in the application

- Author: Create new author, Update, and Delete author
- User: Create new book, update password, request new password,
- Book: Create new book, update information of book, reserve books, cancel reservation, delete book (Admin only)

[Link to API Document](https://github.com/riofed5/API-document) 
