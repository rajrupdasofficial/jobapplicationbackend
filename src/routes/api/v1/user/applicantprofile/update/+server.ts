import { DataAPIClient } from "@datastax/astra-db-ts";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import {apiverification} from "$lib/apiverification";

const CONNECT_TOKEN = env.DB_TOKEN;
const CONNECT_URI = env.DB_URL || ''

const client = new DataAPIClient(CONNECT_TOKEN);
const db = client.db(CONNECT_URI);

interface UpdateApplicantProfile {
    userid:string
    firstname: string;
    lastname: string;
    dob: string;
    username: string;
    profileimage:string;
    headerimage:string;
    aboutme:string;
    email: string;
    password: string;
}

export const PATCH: RequestHandler = (async (event ) => {
    const verificationResult = await apiverification()(event);
    if (verificationResult) {
        return verificationResult;
    }
    try{
        const data: UpdateApplicantProfile = await event.request.json();
        const {firstname,lastname,dob,username,profileimage,headerimage,aboutme,email,password,userid} = data;
        update_data = {};

    }catch(e) {
        console.log(e)
    }
})