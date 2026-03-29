import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeHeaderValue(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getCountryName(countryCode: string | null): string | null {
  if (!countryCode) {
    return null;
  }

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode.toUpperCase()) ?? countryCode.toUpperCase();
  } catch {
    return countryCode.toUpperCase();
  }
}

export async function GET(request: Request) {
  const city = normalizeHeaderValue(request.headers.get("x-vercel-ip-city"));
  const countryCode = normalizeHeaderValue(request.headers.get("x-vercel-ip-country"));
  const country = getCountryName(countryCode);
  const location = normalizeHeaderValue([city, country].filter(Boolean).join(", "));

  return NextResponse.json(
    {
      location,
      city,
      country,
      countryCode,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
