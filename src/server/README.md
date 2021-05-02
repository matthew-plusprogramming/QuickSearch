# QuickSearch Server
QuickSearch is a publicly accessible autocomplete and trie server.

It is written in Node and TypeScript, using [the Express web framework](https://expressjs.com/).

This server is hosted on an AWS EC2 instance and is publically accessable at [3.21.127.234](http://3.21.127.234).

The CLI tool interacts with the server by sending requests to the various endpoints.

## Endpoints

* [Add](#add): `POST /add/`
* [Delete](#delete): `DELETE /delete/`
* [Search](#search): `GET /search/`
* [Autocomplete](#autocomplete): `GET /autocomplete`
* [Display](#display): `GET /display/`


## Add
Adds a phrase to the trie

**URL**: `/add/`

**Method**: `POST`

**Data**
```json
{
  "keyword": "[phrase to insert]"
}
```
**Data Example**
```json
{
  "keyword": "test"
}
```
### Success Response
**Code**: `200 OK`
**Example Content**
```json
{
  "success": true,
  "message": "Successfully added to trie"
}
```
### Error Response
**Code**: `400 BAD REQUEST`
**Reason**: `keyword` is undefined/null
**Example Content**
```json
{
  "success": false,
  "message": "Must specify keyword"
}
```

## Delete
Deletes a phrase from the trie

**URL**: `/delete/`

**Method**: `DELETE`

**Data**
```json
{
  "keyword": "[phrase to delete]"
}
```
**Data Example**
```json
{
  "keyword": "test"
}
```
### Success Response
**Code**: `200 OK`
**Example Content**
```json
{
  "success": true,
  "message": "Successfully deleted from trie"
}
```
### Error Response
**Code**: `400 BAD REQUEST`
**Reason**: `keyword` is undefined/null
**Example Content**
```json
{
  "success": false,
  "message": "Must specify keyword"
}
```

## Search
Check if an entry exists in trie

**URL**: `/search/`

**Method**: `GET`

**Data**
```json
{
  "keyword": "[phrase to search for]"
}
```
**Data Example**
```json
{
  "keyword": "test"
}
```
### Success Response
**Code**: `200 OK`
**Example Content**
```json
{
  "success": true,
  "message": "Successfully searched trie",
  "found": true
}
```
### Error Response
**Code**: `400 BAD REQUEST`
**Reason**: `keyword` is undefined/null
**Example Content**
```json
{
  "success": false,
  "message": "Must specify keyword"
}
```

## Autocomplete
Returns a list of autocomplete suggestions

**URL**: `/autocomplete/`

**Method**: `GET`

**Data**
```json
{
  "keyword": "[phrase to suggest autocompletions for]"
}
```
**Data Example**
```json
{
  "keyword": "te"
}
```
### Success Response
**Code**: `200 OK`
**Example Content**
```json
{
  "success": true,
  "message": "Successfully generated autocomplete suggestions",
  "suggestions": ["tes", "test2"]
}
```
### Error Response
**Code**: `400 BAD REQUEST`
**Reason**: `keyword` is undefined/null
**Example Content**
```json
{
  "success": false,
  "message": "Must specify keyword",
}
```

## Display
Returns internal JSON representation of trie

**URL**: `/display/`

**Method**: `GET`

### Success Response
**Code**: `200 OK`
**Example Content**
```json
{
  "success": true,
  "message": "Fetched trie successfully",
  "trie": {"h": {"e": {"l": {"l": {"o": {"**": true}}}}, "i": {"**": true}}}
}
```
