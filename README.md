# Cartly - Server

## Built By
Jared Angel Escobedo

## Links
Live site: https://cart-client.vercel.app  
Server: https://cartly-001.herokuapp.com   
Client Repo: https://github.com/JaredAngel/cartly-client  
Server Repo: https://github.com/JaredAngel/cartly-server

### Summary
Cartly allows you to log your favorite recipes in your own private journal. 
Making it easier to keep a list of all required ingredients handy for grocery shopping!

## API Documentation

### `/recipes`

##### REQUEST: `GET /recipes`
##### RESPONSE:
<pre><code>
[
    {
        "id": 1,
        "title": "First Recipe",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "author_id": 1
    },
    {
        "id": 2,
        "title": "Second Recipe",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "author_id": 1
    },
    {
        "id": 3,
        "title": "Third Recipe",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "author_id": 2
    },
    {
        "id": 4,
        "title": "Fourth Recipe",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "author_id": 2
    }
]
</pre></code>

##### REQUEST: `GET /recipes/recipe_id`
##### RESPONSE:
<pre><code>
{
    "id": 2,
    "title": "Second Recipe",
    "created_ts": "2029-01-22T16:28:32.615Z",
    "author_id": 1
}
</pre></code>

##### REQUEST: `POST /recipes`
##### RESPONSE:
<pre><code>
{
    "id": 3,
    "title": "Fifth Recipe",
    "created_ts": "2020-12-17T07:32:08.307Z",
    "author_id": 3
}
</pre></code>

##### REQUEST: `DELETE /recipes/recipe_id`
##### RESPONSE:
<pre><code>
{} // Recipe is removed from database
</pre></code>

### `/ingredients`

##### REQUEST: `GET /ingredients`
##### RESPONSE:
<pre><code>
[
    {
        "id": 1,
        "title": "First ingredient!",
        "label": "Spices",
        "content": "Lorem Ipsum dolor sit",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "recipe_id": 1,
        "author_id": 1
    },
    {
        "id": 2,
        "title": "Second ingredient!",
        "label": "Meat/Fish",
        "content": "Lorem Ipsum dolor sit",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "recipe_id": 1,
        "author_id": 1
    },
    {
        "id": 3,
        "title": "Third ingredient!",
        "label": "Produce",
        "content": "Lorem Ipsum dolor sit",
        "created_ts": "2029-01-22T16:28:32.615Z",
        "recipe_id": 2,
        "author_id": 1
    }
]
</pre></code>

##### REQUEST: `GET /ingredients/ingredient_id`
##### RESPONSE:
<pre><code>
{
    "id": 5,
    "title": "Fifth ingredient!",
    "label": "Other",
    "content": "Lorem Ipsum dolor sit",
    "created_ts": "2029-01-22T16:28:32.615Z",
    "recipe_id": 3,
    "author_id": 2
}
</pre></code>

##### REQUEST: `POST /ingredients`
##### RESPONSE:
<pre><code>
{
    "title": "First ingredient!",
    "label": "Spices",
    "content": "Lorem Ipsum dolor sit",
    "created_ts": "2029-01-22T16:28:32.615Z",
    "recipe_id": 1,
    "author_id": 1
}
</pre></code>

##### REQUEST: `DELETE /ingredients/ingredient_id`
##### RESPONSE:
<pre><code>
{} // Ingredient is removed from database
</pre></code>

### `/users`

##### REQUEST: `POST /users`
##### RESPONSE:
<pre><code>
{
    "id": "1",
    "firstname": "Sous",
    "lastname": "Chef_1,
    "username": "SousChef_1",
    "password": "secret_sauce" // JWT encrypted
}
</pre></code>

## Technologies
- Front End
  * HTML
  * CSS
  * JavaScript
  * React
- Back End
  * Node.js
  * Express
  * Postgres