import { NextRequest, NextResponse } from "next/server";
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("serverToken")?.value;

    if (!token) {
        console.log("No token");    
        return NextResponse.redirect(new URL("/", request.url));
    }

    try {
        const hardcodedSecret = "your_super_secret_key_must_match_api"; 
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || hardcodedSecret);
        
        const { payload } = await jose.jwtVerify(token, secret);

        if (!payload) {
            console.log("Invalid token");
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.log("Token verification error:", error);
        return NextResponse.redirect(new URL("/", request.url));
    }
}

export const config = {
    matcher: "/profile/:path*",
};