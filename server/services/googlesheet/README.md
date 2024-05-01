# Using Google Sheet API 
Follow the set up instruction for Oauth. 
https://developers.google.com/sheets/api/quickstart/nodejs

Once you have the `token.json` and `credential.json `, you could cosume the apps. 

```js
updateValues(
  "asdfasdfawefawefawe",
  "Sheet1!A1",
  "RAW",
  [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
  ]
);
```