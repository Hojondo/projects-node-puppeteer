const router = require('koa-router')()
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install


router.prefix('/users')

// router.get('/', function (ctx, next) {
//   superagent
//         .get('') 
//         .end(function(req,res){
//             //do something
//             console.log(req,res)
//         })
// })

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
