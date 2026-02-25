"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  sendContactEmail,
  uploadContactFile,
  uploadContactPhoto,
  updateContact,
} from "@/lib/actions/contact-actions";
import { useAuthStore } from "@/store/authStore";

const ContactForm = ({ data }: { data: any }) => {
  const [formData, setFormData] = useState({
    name: "",
    projectname: "",
    email: "",
    project: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  // Photo editing
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(data?.photoUrl || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const isValid =
      formData.name.trim() !== "" &&
      formData.projectname.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.project.trim() !== "" &&
      formData.message.trim() !== "";
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadContactFile(buffer, file.name);

      if (result.success && result.fileUrl) {
        setUploadedFile({
          name: file.name,
          url: result.fileUrl,
        });
      } else {
        setError("Erreur lors de l'upload du fichier");
      }
    } catch (error) {
      console.error("Erreur upload fichier:", error);
      setError("Erreur lors de l'upload du fichier");
    }
    setUploadingFile(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await uploadContactPhoto(base64);

      if (result.success) {
        setPhotoUrl(result.photoUrl);
      } else {
        setError("Erreur lors de l'upload de la photo");
      }
    } catch (error) {
      console.error("Erreur upload photo:", error);
      setError("Erreur lors de l'upload de la photo");
    }
    setUploadingPhoto(false);
  };

  const handleSavePhoto = async () => {
    setPhotoLoading(true);
    const result = await updateContact({
      email: data.email,
      adresse: data.adresse,
      photoUrl: photoUrl,
      mission: data.mission,
      telephones: data.telephones || [],
    });

    if (result.success) {
      setIsEditingPhoto(false);
    }
    setPhotoLoading(false);
  };

  const reset = () => {
    setFormData({
      name: "",
      projectname: "",
      email: "",
      project: "",
      message: "",
    });
    setUploadedFile(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoader(true);
    setError("");

    const result = await sendContactEmail({
      name: formData.name,
      projectname: formData.projectname,
      email: formData.email,
      project: formData.project,
      message: formData.message,
      fileUrl: uploadedFile?.url || undefined,
    });

    if (result.success) {
      setSubmitted(true);
      setShowThanks(true);
      reset();

      setTimeout(() => {
        setShowThanks(false);
      }, 5000);
    } else {
      setError("Erreur lors de l'envoi du message. Veuillez réessayer.");
    }

    setLoader(false);
  };
  return (
    <section className="dark:bg-darkmode pb-24 !pt-0">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
          <div className="col-span-6 md:pt-12 pt-0 relative">
            <h2 className="max-w-72 text-[40px] leading-[3rem] font-bold mb-9">
              Demander un devis
            </h2>
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap w-full m-auto justify-between"
            >
              <div className="sm:flex gap-3 w-full">
                <div className="mx-0 my-2.5 flex-1">
                  <label htmlFor="name" className="pb-3 inline-block text-base">
                    Nom complet*
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full text-base px-4 rounded-lg py-2.5 border-border border-solid dark:border-darkborder dark:text-white dark:bg-transparent border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                  />
                </div>
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="projectname"
                    className="pb-3 inline-block text-base"
                  >
                    Nom du projet*
                  </label>
                  <input
                    id="projectname"
                    type="text"
                    name="projectname"
                    value={formData.projectname}
                    onChange={handleChange}
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-darkborder border-solid dark:text-white  dark:bg-transparent border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                  />
                </div>
              </div>
              <div className="sm:flex gap-3 w-full">
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="email"
                    className="pb-3 inline-block text-base"
                  >
                    Adresse email*
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-darkborder border-solid dark:text-white  dark:bg-transparent border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                  />
                </div>
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="project"
                    className="pb-3 inline-block text-base"
                  >
                    Type de projet*
                  </label>
                  <select
                    name="project"
                    id="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:text-white border-solid dark:bg-darkmode dark:border-darkborder border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:outline-0"
                  >
                    <option value="">Choisissez le type d'application</option>
                    <option value="Application éducative">
                      Application éducative
                    </option>
                    <option value="Application e-commerce">
                      Application e-commerce
                    </option>
                    <option value="Application CRM">Application CRM</option>
                    <option value="Application santé">Application santé</option>
                    <option value="Application d'analyse web">
                      Application d'analyse web
                    </option>
                    <option value="Application bancaire">
                      Application bancaire
                    </option>
                  </select>
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="photo" className="text-base inline-block pb-4">
                  Fichier (optionnel)
                </label>
                <div className="flex items-center gap-4 mb-4">
                  {uploadedFile && (
                    <div className="text-sm bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg">
                      ✓ {uploadedFile.name}
                    </div>
                  )}
                  <input
                    id="photo"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="flex-1 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  {uploadingFile && <span className="text-sm">Upload...</span>}
                </div>
              </div>
              <div className="w-full">
                <label
                  htmlFor="message"
                  className="text-base inline-block pb-4"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="border border-border px-4 py-2 w-full focus:outline-hidden bg-white dark:bg-darkmode dark:text-white dark:border-darkborder rounded-lg dark:focus:border-primary focus:border-primary h-32 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Décrivez votre projet ou toute autre information que vous souhaitez partager"
                ></textarea>
              </div>
              {error && (
                <div className="w-full text-red-500 text-sm my-2">{error}</div>
              )}
              <div className="mx-0 my-2.5 w-full">
                <button
                  type="submit"
                  disabled={!isFormValid || loader}
                  className={`border leading-none px-6 text-lg font-medium py-4 rounded-lg 
                    ${!isFormValid || loader ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-primary border-primary text-white hover:bg-transparent hover:text-primary cursor-pointer"}`}
                >
                  {loader ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
            {showThanks && (
              <div className="text-white bg-green-400 rounded-full px-4 text-lg mb-4.5 mt-2 absolute flex items-center gap-2">
                Demande envoyée avec succès. Merci.
                <div className="w-3 h-3 rounded-full animate-spin border-2 border-solid border-white border-t-transparent"></div>
              </div>
            )}
          </div>
          <div className="col-span-6">
            {isEditingPhoto && isAdmin && data?.photoUrl ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Modifier la photo</h3>
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="preview"
                    className="w-full rounded-lg object-cover"
                  />
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nouvelle photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="w-full file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  {uploadingPhoto && (
                    <span className="text-sm text-primary">Upload...</span>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSavePhoto}
                    disabled={photoLoading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {photoLoading ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={() => setIsEditingPhoto(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={
                    photoUrl ||
                    data?.photoUrl ||
                    "/images/contact-page/contact.webp"
                  }
                  alt="Contact"
                  width={1300}
                  height={0}
                  quality={100}
                  style={{ width: "100%", height: "auto" }}
                  className="rounded-lg"
                />
                {isAdmin && data?.photoUrl && (
                  <button
                    onClick={() => setIsEditingPhoto(true)}
                    className="absolute top-4 right-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Modifier photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
