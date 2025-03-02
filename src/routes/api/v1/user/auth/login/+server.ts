import {DataAPIClient} from "@datastax/astra-db-ts";
import {json} from "@sveltejs/kit";
import argon2 from "argon2";
import type {RequestHandler} from "@sveltejs/kit";
import {env} from "$env/dynamic/private";
import {apiverification} from "$lib/apiverification";
import {createSigner} from "fast-jwt";

const CONNECT_TOKEN:string = env.DB_TOKEN||'';
const CONNECT_URI:string = env.DB_URL || '';
const jwtSecret:string = env.JWT_SECRET_KEY || '';
const sign= createSigner({key:jwtSecret})

const client = new DataAPIClient(CONNECT_TOKEN);
const db = client.db(CONNECT_URI);

interface LoginData{
    email: string;
    password: string;
}
const users_collection = db.collection("users");

export const POST: RequestHandler = (async (event ) => {
    const verificationResult = await apiverification()(event);
    if (verificationResult) {
        return verificationResult;
    }
    try{
        const data: LoginData = await  event.request.json()
        const {email,password} = data;
        if(!email||!password){
            return  json({message:"Missing required fields"},{status:400})
        }

        const userdata = await users_collection.findOne({"email":email})
        if(!userdata){
            return json({message:"User doesnot exists"},{status:404})
        }
        const userpassword:string= userdata['password'] ;
        if(!userpassword){
            return json({message:'Password field is missing'},{status:400})
        }
        const verifypassword = await argon2.verify(userpassword,password)
        if(verifypassword){
            const payload ={
                'uid':userdata['uid'],
                'email':userdata['email'],
                'userrole':userdata['role']
            }
            const token =  sign(payload)

            return json({message:"Login successful",tokenpayload:token},{status:200})

        }else{
            return json({message:"Password doesnot match"},{status:400})
        }

    }catch (e) {
        console.log(e)
        return json({message:"Internal server error"},{status:500})
    }

});