// import React, { useState } from "react";
// import useAuthHook from "../hooks/useAuthHook";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { completeOnboarding } from "../lib/api";
// import {
//   LoaderIcon,
//   MapPinIcon,
//   ShipWheelIcon,
//   ShuffleIcon,
//   CameraIcon,
// } from "lucide-react";
// import { LANGUAGES } from "../contents/index.js";
// import { axiosInstance } from "../lib/axios.js";

// function OnboardingPage() {
//   const { authUser } = useAuthHook();
//   const queryClient = useQueryClient();
//   const [uploading, setUploading] = useState(false);

//   const [formState, setFormState] = useState({
//     fullname: authUser?.fullname || "",
//     bio: authUser?.bio || "",
//     nativeLanguage: authUser?.nativeLanguage || "",
//     learningLanguage: authUser?.learningLanguage || "",
//     location: authUser?.location || "",
//     profilePic: authUser?.profilePic || "",
//   });

//   const { mutate: onboardingMutation, isPending } = useMutation({
//     mutationFn: completeOnboarding,
//     onSuccess: () => {
//       toast.success("Onboarding completed !!");
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log({ formState });

//     onboardingMutation(formState);
//   };

//   const handleRandomAvatar = () => {
//     const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
//     const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

//     setFormState({ ...formState, profilePic: randomAvatar });
//     toast.success("Random profile picture generated!");
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       setUploading(true);

//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await axiosInstance.post("/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const data = res.data;

//       if (data.url) {
//         setFormState({ ...formState, profilePic: data.url });
//         toast.success("Profile picture uploaded!");
//       } else {
//         toast.error(data.error || "Upload failed");
//       }
//     } catch (err) {
//       toast.error("Error uploading file");
//       console.error(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
//       <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
//         <div className="card-body p-6 sm:p-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
//             Complete Your Profile
//           </h1>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* PROFILE PIC CONTAINER */}
//             <div className="flex flex-col items-center justify-center space-y-4">
//               {/* IMAGE PREVIEW */}
//               <div className="size-32 rounded-full bg-base-300 overflow-hidden">
//                 {formState.profilePic ? (
//                   <img
//                     src={formState.profilePic}
//                     alt="Profile Preview"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center h-full">
//                     <CameraIcon className="size-12 text-base-content opacity-40" />
//                   </div>
//                 )}
//               </div>

//               {/* Generate Random Avatar BTN */}
//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={handleRandomAvatar}
//                   className="btn btn-accent"
//                 >
//                   <ShuffleIcon className="size-4 mr-2" />
//                   Generate Random Avatar
//                 </button>
//               </div>
//             </div>

//             {/* upload picture */}
//             <div className="flex items-center gap-2">
//               <label className="btn btn-secondary cursor-pointer">
//                 <CameraIcon className="size-4 mr-2" />
//                 {uploading ? "Uploading..." : "Upload Profile Picture"}
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="hidden"
//                   disabled={uploading}
//                 />
//               </label>
//             </div>

//             {/* FULL NAME */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Full Name</span>
//               </label>
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formState.fullname}
//                 onChange={(e) =>
//                   setFormState({ ...formState, fullname: e.target.value })
//                 }
//                 className="input input-bordered w-full"
//                 placeholder="Your full name"
//               />
//             </div>

//             {/* BIO */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Bio</span>
//               </label>
//               <textarea
//                 name="bio"
//                 value={formState.bio}
//                 onChange={(e) =>
//                   setFormState({ ...formState, bio: e.target.value })
//                 }
//                 className="textarea textarea-bordered h-24"
//                 placeholder="Tell others about yourself and your language learning goals"
//               />
//             </div>

//             {/* LANGUAGES */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* NATIVE LANGUAGE */}
//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">Native Language</span>
//                 </label>
//                 <select
//                   name="nativeLanguage"
//                   value={formState.nativeLanguage}
//                   onChange={(e) =>
//                     setFormState({
//                       ...formState,
//                       nativeLanguage: e.target.value,
//                     })
//                   }
//                   className="select select-bordered w-full"
//                 >
//                   <option value="">Select your native language</option>
//                   {LANGUAGES.map((lang) => (
//                     <option key={`native-${lang}`} value={lang.toLowerCase()}>
//                       {lang}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* LEARNING LANGUAGE */}
//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">Learning Language</span>
//                 </label>
//                 <select
//                   name="learningLanguage"
//                   value={formState.learningLanguage}
//                   onChange={(e) =>
//                     setFormState({
//                       ...formState,
//                       learningLanguage: e.target.value,
//                     })
//                   }
//                   className="select select-bordered w-full"
//                 >
//                   <option value="">Select language you're learning</option>
//                   {LANGUAGES.map((lang) => (
//                     <option key={`learning-${lang}`} value={lang.toLowerCase()}>
//                       {lang}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* LOCATION */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Location</span>
//               </label>
//               <div className="relative">
//                 <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
//                 <input
//                   type="text"
//                   name="location"
//                   value={formState.location}
//                   onChange={(e) =>
//                     setFormState({ ...formState, location: e.target.value })
//                   }
//                   className="input input-bordered w-full pl-10"
//                   placeholder="City, Country"
//                 />
//               </div>
//             </div>

//             {/* SUBMIT BUTTON */}

//             <button
//               className="btn btn-primary w-full"
//               disabled={isPending}
//               type="submit"
//             >
//               {!isPending ? (
//                 <>
//                   <ShipWheelIcon className="size-5 mr-2" />
//                   Complete Onboarding
//                 </>
//               ) : (
//                 <>
//                   <LoaderIcon className="animate-spin size-5 mr-2" />
//                   Onboarding...
//                 </>
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default OnboardingPage;

import React, { useState } from "react";
import useAuthHook from "../hooks/useAuthHook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  CameraIcon,
  UploadIcon,
  XIcon,
  CheckIcon,
} from "lucide-react";
import { LANGUAGES } from "../contents/index.js";
import { axiosInstance } from "../lib/axios.js";

function OnboardingPage() {
  const { authUser } = useAuthHook();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formState, setFormState] = useState({
    fullname: authUser?.fullname || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Onboarding completed !!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ formState });
    onboardingMutation(formState);
  };

  const handleRandomAvatar = async () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      if (data.url) {
        setFormState({ ...formState, profilePic: data.url });
        toast.success("Profile picture uploaded successfully!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading file");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeProfilePic = () => {
    setFormState({ ...formState, profilePic: "" });
    toast.success("Profile picture removed");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ENHANCED PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* IMAGE PREVIEW WITH OVERLAY */}
              <div className="relative group">
                <div className="size-36 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-1 shadow-lg">
                  <div className="size-full rounded-full bg-base-300 overflow-hidden relative">
                    {formState.profilePic ? (
                      <>
                        <img
                          src={formState.profilePic}
                          alt="Profile Preview"
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                        {/* Remove button overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={removeProfilePic}
                            className="btn btn-sm btn-error btn-circle"
                            title="Remove picture"
                          >
                            <XIcon className="size-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CameraIcon className="size-16 text-base-content opacity-40" />
                      </div>
                    )}

                    {/* Upload success indicator */}
                    {formState.profilePic && (
                      <div className="absolute -bottom-2 -right-2 bg-success rounded-full p-1.5 shadow-md">
                        <CheckIcon className="size-4 text-success-content" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <LoaderIcon className="animate-spin size-8 text-white" />
                  </div>
                )}
              </div>

              {/* UPLOAD METHODS */}
              <div className="w-full max-w-md space-y-4">
                {/* Drag & Drop Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-base-content/30 hover:border-primary/50 hover:bg-base-300/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={uploading}
                  />

                  <div className="space-y-2">
                    <UploadIcon
                      className={`size-8 mx-auto ${
                        dragActive ? "text-primary" : "text-base-content/70"
                      }`}
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {dragActive
                          ? "Drop image here"
                          : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-base-content/60 text-xs mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>

                  {uploading && (
                    <div className="absolute inset-0 bg-base-300/80 rounded-xl flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <LoaderIcon className="animate-spin size-4" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-base-content/20"></div>
                  <span className="text-sm text-base-content/60 font-medium">
                    OR
                  </span>
                  <div className="flex-1 border-t border-base-content/20"></div>
                </div>

                {/* Generate Random Avatar Button */}
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-outline btn-accent w-full gap-2 hover:scale-105 transition-transform"
                  disabled={uploading}
                >
                  <ShuffleIcon className="size-4" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* REST OF THE FORM REMAINS THE SAME */}

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullname}
                onChange={(e) =>
                  setFormState({ ...formState, fullname: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
