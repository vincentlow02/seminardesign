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

function parseCoordinate(value: string | null): number | null {
  const normalized = normalizeHeaderValue(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickLocationLabel(payload: {
  address?: Record<string, string | undefined>;
  display_name?: string;
}): string | null {
  const address = payload.address ?? {};
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state_district ||
    address.state;
  const country = address.country;

  const compact = normalizeHeaderValue([city, country].filter(Boolean).join(", "));
  return compact ?? normalizeHeaderValue(payload.display_name ?? null);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const browserLatitude = parseCoordinate(url.searchParams.get("latitude"));
  const browserLongitude = parseCoordinate(url.searchParams.get("longitude"));
  const latitude = browserLatitude ?? parseCoordinate(request.headers.get("x-vercel-ip-latitude"));
  const longitude = browserLongitude ?? parseCoordinate(request.headers.get("x-vercel-ip-longitude"));
  const source = browserLatitude !== null && browserLongitude !== null ? "browser" : "ip";
  const city = normalizeHeaderValue(request.headers.get("x-vercel-ip-city"));
  const countryCode = normalizeHeaderValue(request.headers.get("x-vercel-ip-country"));
  const country = getCountryName(countryCode);
  let location = normalizeHeaderValue([city, country].filter(Boolean).join(", "));
  let temperatureCelsius: number | null = null;

  if (latitude !== null && longitude !== null) {
    try {
      if (source === "browser") {
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          {
            cache: "no-store",
            headers: {
              "Accept-Language": request.headers.get("accept-language") ?? "en",
              "User-Agent": "seminardesign-app/1.0",
            },
          }
        );

        if (reverseResponse.ok) {
          const reversePayload = (await reverseResponse.json()) as {
            address?: Record<string, string | undefined>;
            display_name?: string;
          };
          location = pickLocationLabel(reversePayload) ?? location;
        }
      }

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=celsius`,
        {
          cache: "no-store",
        }
      );

      if (weatherResponse.ok) {
        const payload = (await weatherResponse.json()) as {
          current?: { temperature_2m?: number | null };
        };
        const nextTemperature = payload.current?.temperature_2m;
        temperatureCelsius = typeof nextTemperature === "number" ? Math.round(nextTemperature) : null;
      }
    } catch {
      temperatureCelsius = null;
    }
  }

  return NextResponse.json(
    {
      location,
      city,
      country,
      countryCode,
      latitude,
      longitude,
      temperatureCelsius,
      source,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
