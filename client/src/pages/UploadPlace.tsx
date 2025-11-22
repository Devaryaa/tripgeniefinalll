import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, MapPin, FileImage, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface SubmissionResult {
  status: "verified" | "pending_review";
  place: {
    id: number;
    title: string;
    status: string;
    verificationDetails: {
      exifDistance: string;
      exifCoords: string;
      reverseImageFound: boolean;
      aiFakeScore: string;
    };
  };
}

const UploadPlace = () => {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a place title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!latitude || isNaN(parseFloat(latitude))) {
      toast.error("Please enter a valid latitude");
      return;
    }
    if (!longitude || isNaN(parseFloat(longitude))) {
      toast.error("Please enter a valid longitude");
      return;
    }
    if (!imageFile) {
      toast.error("Please upload a photo");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("image", imageFile);

      const response = await fetch("/api/places/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit place");
      }

      const data = await response.json();
      setSubmissionResult(data.place);
      
      toast.success(
        data.place.status === "verified"
          ? "Place verified and added!"
          : "Place submitted for review"
      );

      // Reset form
      setTitle("");
      setDescription("");
      setLatitude("");
      setLongitude("");
      setImageFile(null);
      setImagePreview("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit place");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Share a Hidden Gem
          </h1>
          <p className="text-muted-foreground">
            Found an amazing place? Share it with fellow travelers and help them discover it!
          </p>
        </div>

        {submissionResult ? (
          <Card className="p-6 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`rounded-lg p-3 ${
                  submissionResult.status === "verified"
                    ? "bg-success/20"
                    : "bg-warning/20"
                }`}
              >
                {submissionResult.status === "verified" ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-warning" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {submissionResult.place.title}
                </h2>
                <div className="mb-4">
                  <Badge
                    variant={
                      submissionResult.status === "verified"
                        ? "default"
                        : "secondary"
                    }
                    className="mb-4"
                    data-testid={`badge-status-${submissionResult.status}`}
                  >
                    {submissionResult.status === "verified"
                      ? "✓ Verified"
                      : "⏳ Pending Review"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>EXIF Location:</strong>{" "}
                    {submissionResult.place.verificationDetails.exifDistance}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>EXIF Coordinates:</strong>{" "}
                    {submissionResult.place.verificationDetails.exifCoords}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Image Search:</strong>{" "}
                    {submissionResult.place.verificationDetails.reverseImageFound
                      ? "Previously found online"
                      : "Original image"}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>AI Authenticity Score:</strong>{" "}
                    {submissionResult.place.verificationDetails.aiFakeScore}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSubmissionResult(null);
                  setTitle("");
                  setDescription("");
                  setLatitude("");
                  setLongitude("");
                  setImageFile(null);
                  setImagePreview("");
                }}
                variant="outline"
                data-testid="button-submit-another"
              >
                Submit Another Place
              </Button>
              <Button
                onClick={() => setLocation("/hidden-gems")}
                data-testid="button-view-gems"
              >
                View All Hidden Gems
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Place Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Secret Garden Café"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-place-title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Tell us what makes this place special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                  data-testid="input-place-description"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Latitude *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 48.8566"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    data-testid="input-latitude"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Longitude *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2.3522"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    data-testid="input-longitude"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Photo (with location data) *
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                        data-testid="img-preview"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            document.getElementById("file-input")?.click();
                          }}
                          data-testid="button-change-photo"
                        >
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-primary/10 rounded-lg p-3">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-muted-foreground">
                            JPG or PNG (max 10MB)
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Photo must have location metadata for verification
                          </p>
                        </div>
                      </div>
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        data-testid="input-photo"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex gap-3">
                  <FileImage className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground">
                    <strong>Verification:</strong> Your photo will be checked using:
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      <li>GPS location metadata (EXIF data)</li>
                      <li>Reverse image search for originality</li>
                      <li>AI detection to ensure authenticity</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
                data-testid="button-submit-place"
              >
                {loading ? "Verifying..." : "Share This Place"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPlace;
