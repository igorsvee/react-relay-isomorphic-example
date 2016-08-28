export default function processSass(a, b) {
  console.log("xxx1")
  console.log(a)

  console.log("xxx2")
  console.log(b)

  return ''
};

Object.prototype.extend = function () {
  return Object.assign(this, ...arguments)
}