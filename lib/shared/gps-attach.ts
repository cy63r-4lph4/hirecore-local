import { toast } from "@/hooks/use-toast";

interface GpsAttachOptions {
  setForm: React.Dispatch<
    React.SetStateAction<{
      locationLat: string;
      locationLng: string;
    }>
  >;
  setErrors: React.Dispatch<
    React.SetStateAction<{
      coordinates?: string;
    }>
  >;
  setLocating: React.Dispatch<React.SetStateAction<boolean>>;
}

export function attachCurrentLocation({ setForm, setErrors, setLocating }: GpsAttachOptions) {
    if (typeof window === "undefined") return;

    if (!("geolocation" in navigator)) {
      toast({
        variant: "destructive",
        title: "GPS failed on this browser",
        description:
          "On iPhone, open Google Maps, long-press the location, copy the coordinates, and paste them manually below.",
      });
      return;
    }

    if (!window.isSecureContext) {
      toast({
        variant: "destructive",
        title: "GPS needs HTTPS",
        description:
          "iOS blocks location on insecure pages. Use HTTPS, or enter the coordinates manually.",
      });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          locationLat: String(Number(position.coords.latitude.toFixed(6))),
          locationLng: String(Number(position.coords.longitude.toFixed(6))),
        }));

        setErrors((current) => ({
          ...current,
          coordinates: undefined,
        }));

        toast({
          title: "GPS attached",
          description: "Coordinates were added to this task.",
        });

        setLocating(false);
      },
      (error) => {
        let description =
          "Could not read GPS coordinates. You can still enter the location manually.";

        if (error.code === error.PERMISSION_DENIED) {
          description =
            "Location permission was blocked. On iPhone, allow location access in Safari settings or enter coordinates manually.";
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          description =
            "This device could not determine its position. Enter coordinates manually.";
        }

        if (error.code === error.TIMEOUT) {
          description =
            "GPS lookup timed out. Try again outside, or enter coordinates manually.";
        }

        toast({
          variant: "destructive",
          title: "GPS capture failed",
          description,
        });

        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    );
  }