import nodemailer from 'nodemailer'

 export const transport=nodemailer.createTransport({
    host:'smtp.gmail.com',
    secure:true,
    port:465,
    auth:{
        user:"rahulsocialpilot@gmail.com",
        pass:"mtkd gdxe pban vtea"
    }
})

