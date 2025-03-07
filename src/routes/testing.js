import Router from "koa-router";


const router=new Router({prefix:"/route"})


router.get('/',async(ctx)=>{
    ctx.body={message:"server is up and running"}
})

export default router