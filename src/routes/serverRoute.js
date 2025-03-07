import Router from "koa-router";

const router=new Router({prefix:'/testing'})

router.get('/',async(ctx)=>{
    ctx.body='server is running up'
  })
export default router