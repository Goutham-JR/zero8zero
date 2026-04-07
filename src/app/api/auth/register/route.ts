import { NextRequest, NextResponse } from "next/server";
import { logToSheet } from "@/lib/google-sheet";

const OBD_API = "https://obd3api.expressivr.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { username, password, name, emailid, number, company, address, pincode } = body;

    if (!username || !password || !name || !emailid || !number || !company || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Login as reseller — credentials stay server-side
    const resellerUsername = process.env.RESELLER_USERNAME;
    const resellerPassword = process.env.RESELLER_PASSWORD;

    if (!resellerUsername || !resellerPassword) {
      console.error("Reseller credentials not configured in environment");
      return NextResponse.json({ error: "Registration service unavailable" }, { status: 503 });
    }

    // Trial expiry: 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const expiryDate = `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, "0")}-${String(expiry.getDate()).padStart(2, "0")} 23:59:59`;

    const loginRes = await fetch(`${OBD_API}/api/obd/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: resellerUsername, password: resellerPassword }),
    });
    const loginData = await loginRes.json();

    if (!loginData.token) {
      return NextResponse.json({ error: "Registration service unavailable" }, { status: 503 });
    }

    // Register the new user
    const registerRes = await fetch(`${OBD_API}/api/obd/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        username,
        password,
        planId: "100318",
        name,
        emailid,
        number,
        address: address || "",
        company,
        pincode,
        parent: loginData.userid,
        accountType: "0",
        userType: "user",
        expiryDate,
        auth_token: loginData.token,
        groupRows: JSON.stringify({ groupsList: [{ groupId: "34", groupName: "BLR_ALL" }] }),
        locationRows: JSON.stringify({ locationsList: [{ locationId: "3", locationName: "Bangalore" }] }),
        moduleId: "1",
        planType: "0",
      }),
    });

    const text = await registerRes.text();
    const result = text ? JSON.parse(text) : {};

    if (result.userId) {
      // Log to Google Sheet server-side
      await logToSheet({
        _sheet: "Users",
        userId: String(result.userId),
        username,
        name,
        email: emailid,
        phone: number,
        company,
        credits: "0",
        creditsUsed: "0",
        userType: "user",
        planName: "Trial",
        pulsePrice: "",
        pulseDuration: "15",
        accountType: "0",
        registeredOn: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        expiryDate,
        groups: "BLR_ALL",
        locations: "Bangalore",
        modules: "",
        status: "Active",
      });

      return NextResponse.json({ userId: result.userId, message: "Registration successful" });
    }

    return NextResponse.json(
      { error: result.message || "Registration failed" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
