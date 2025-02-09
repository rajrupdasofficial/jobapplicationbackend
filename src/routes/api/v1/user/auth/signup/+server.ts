import { DataAPIClient } from "@datastax/astra-db-ts";
import { json } from "@sveltejs/kit";
import argon2 from "argon2";
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import {apiverification} from "$lib/apiverification";

const CONNECT_TOKEN = env.DB_TOKEN;
const CONNECT_URI = env.DB_URL || '';

const client = new DataAPIClient(CONNECT_TOKEN);
const db = client.db(CONNECT_URI);

interface SignupData {
    username?: string;
    email?: string;
    password?: string;
    usertype?:string;
}

const users_collection = db.collection('users');


export const POST: RequestHandler =  (async (event ) => {
    const verificationResult = await apiverification()(event);
    if (verificationResult) {
        return verificationResult;
    }

    try {
        const data: SignupData = await event.request.json();
        const { username, email, password,usertype } = data;

        if (!username || !email || !password) {
            return json({ message: 'Missing required fields' }, { status: 400 });
        }

        const existing_user = await users_collection.findOne({
            '$or': [
                { 'email': email },
                { 'username': username }
            ]
        });

        if (existing_user) {
            return json({ message: 'Username or email already exists, please use a different one' }, { status: 409 });
        }

        const hashed_password = await argon2.hash(password);
        const insertResult = await users_collection.insertOne({
            'uid': crypto.randomUUID(),
            'username': username,
            'email': email,
            'password': hashed_password,
            'role':usertype
        });

        if (insertResult && insertResult.insertedId) {
            return json({ message: 'User signup successful' }, { status: 201 });
        } else {
            console.error("Error saving user data:", insertResult);
            return json({ message: 'Error saving data, please check the logs' }, { status: 500 });
        }
    } catch (e) {
        console.error("Signup error:", e);
        return json({ message: 'Error occurred while signing up' }, { status: 500 });
    }
});
