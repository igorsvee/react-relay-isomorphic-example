const bcrypt = require("bcrypt-nodejs");
const SALT_FACTOR = 10;
export function genHash(password) {

  return new Promise((resolve, reject) => {
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
      if (err) {
        reject(err)
      }

      bcrypt.hash(password, salt, undefined,
          function (err, hashedPassword) {
            if (err) {
              reject(err)
            }
            resolve(hashedPassword)

          });


    })


  });
}

export function compare(password, hash) {
  return new Promise((resolve, reject)=> {
    bcrypt.compare(password, hash, function (err, res) {
      if (err) {
        reject(err)
      }

      resolve(res);   // res == true
    });

  })
}
