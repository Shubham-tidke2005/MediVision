import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Download,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  downloadMedicalDocument,
  getMedicalDocuments,
  uploadMedicalDocument,
} from "@/features/documents/api/documentApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


const MAX_FILE_SIZE =
  15 * 1024 * 1024;


const DOCUMENT_TYPES = [
  {
    value: "LAB_REPORT",
    label: "Lab Report",
  },
  {
    value: "PRESCRIPTION",
    label: "Prescription",
  },
  {
    value: "MRI",
    label: "MRI",
  },
  {
    value: "XRAY",
    label: "X-ray",
  },
  {
    value: "DISCHARGE_SUMMARY",
    label: "Discharge Summary",
  },
];


function formatBytes(
  bytes
) {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }


  if (
    bytes
    < 1024 * 1024
  ) {
    return `${
      (
        bytes
        / 1024
      ).toFixed(1)
    } KB`;
  }


  return `${
    (
      bytes
      / (
        1024
        * 1024
      )
    ).toFixed(1)
  } MB`;
}


function formatDate(
  value
) {
  if (!value) {
    return "";
  }


  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}


function formatDocumentType(
  value
) {
  const found =
    DOCUMENT_TYPES.find(
      (
        item
      ) =>
        item.value
        === value
    );


  return (
    found?.label
    ?? value
  );
}


export default function PatientDocumentsPage() {
  const queryClient =
    useQueryClient();


  const [
    documentType,
    setDocumentType,
  ] = useState(
    "LAB_REPORT"
  );


  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "medical-documents",
    ],

    queryFn:
      getMedicalDocuments,
  });


  const uploadMutation =
    useMutation({
      mutationFn:
        uploadMedicalDocument,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async () => {
          setSuccessMessage(
            "Medical document uploaded successfully."
          );

          setSelectedFile(
            null
          );


          const input =
            window.document
              .getElementById(
                "medical-document-file"
              );


          if (input) {
            input.value = "";
          }


          await queryClient
            .invalidateQueries({
              queryKey: [
                "medical-documents",
              ],
            });


          await queryClient
            .invalidateQueries({
              queryKey: [
                "patient-medical-history",
              ],
            });
        },

      onError:
        (
          mutationError
        ) => {
          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to upload medical document."
            )
          );
        },
    });


  function handleFileChange(
    event
  ) {
    setErrorMessage("");
    setSuccessMessage("");


    const file =
      event.target.files?.[0];


    if (!file) {
      setSelectedFile(
        null
      );

      return;
    }


    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();


    if (
      ![
        "pdf",
        "jpg",
        "jpeg",
        "png",
      ].includes(
        extension
      )
    ) {
      setSelectedFile(
        null
      );

      setErrorMessage(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );

      event.target.value = "";

      return;
    }


    if (
      file.size
      > MAX_FILE_SIZE
    ) {
      setSelectedFile(
        null
      );

      setErrorMessage(
        "Maximum file size is 15 MB."
      );

      event.target.value = "";

      return;
    }


    setSelectedFile(
      file
    );
  }


  function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (
      !selectedFile
    ) {
      setErrorMessage(
        "Please select a file."
      );

      return;
    }


    uploadMutation.mutate({
      documentType,
      file:
        selectedFile,
    });
  }


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >

      {/* HEADER */}

      <section>
        <p
          className="
            text-sm
            font-semibold
            text-blue-600
          "
        >
          Patient Records
        </p>

        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          Medical Documents
        </h1>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Securely upload and access
          your lab reports, prescriptions,
          MRI images, X-rays and discharge
          summaries.
        </p>
      </section>


      {/* UPLOAD */}

      <form
        onSubmit={
          handleSubmit
        }
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-sky-50
              text-sky-600
            "
          >
            <Upload
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Upload Document
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              PDF, JPG or PNG.
              Maximum 15 MB.
            </p>
          </div>
        </div>


        {errorMessage && (
          <div
            role="alert"
            className="
              mt-5
              rounded-lg
              border
              border-rose-200
              bg-rose-50
              p-4
              text-sm
              text-rose-700
            "
          >
            {errorMessage}
          </div>
        )}


        {successMessage && (
          <div
            role="status"
            className="
              mt-5
              rounded-lg
              border
              border-emerald-200
              bg-emerald-50
              p-4
              text-sm
              text-emerald-700
            "
          >
            {successMessage}
          </div>
        )}


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2
          "
        >
          <div>
            <label
              htmlFor="document-type"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Document Type
            </label>

            <select
              id="document-type"
              value={
                documentType
              }
              onChange={(
                event
              ) =>
                setDocumentType(
                  event.target.value
                )
              }
              disabled={
                uploadMutation
                  .isPending
              }
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-900
              "
            >
              {DOCUMENT_TYPES.map(
                (
                  type
                ) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label
              htmlFor="medical-document-file"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              File
            </label>

            <input
              id="medical-document-file"
              type="file"
              accept="
                .pdf,
                .jpg,
                .jpeg,
                .png,
                application/pdf,
                image/jpeg,
                image/png
              "
              onChange={
                handleFileChange
              }
              disabled={
                uploadMutation
                  .isPending
              }
              className="
                mt-2
                block
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-sm
                text-slate-700
              "
            />
          </div>
        </div>


        {selectedFile && (
          <div
            className="
              mt-4
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              p-3
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              {
                selectedFile.name
              }
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {formatBytes(
                selectedFile.size
              )}
            </p>
          </div>
        )}


        <div
          className="
            mt-5
            flex
            items-start
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            p-4
          "
        >
          <ShieldCheck
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-slate-500
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-slate-500
            "
          >
            The server verifies file size,
            file signature and actual content.
            Original filenames are never used
            as physical storage paths.
          </p>
        </div>


        <div
          className="
            mt-5
            flex
            justify-end
          "
        >
          <button
            type="submit"
            disabled={
              uploadMutation
                .isPending
              || !selectedFile
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              text-sm
              font-semibold
              text-white

              hover:bg-blue-700

              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            <Upload
              className="h-4 w-4"
            />

            {uploadMutation
              .isPending
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </div>
      </form>


      {/* DOCUMENT LIST */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6
        "
      >
        <h2
          className="
            font-semibold
            text-slate-900
          "
        >
          Your Documents
        </h2>


        {isLoading && (
          <p
            className="
              mt-5
              text-sm
              text-slate-500
            "
          >
            Loading documents...
          </p>
        )}


        {isError && (
          <p
            className="
              mt-5
              text-sm
              text-rose-600
            "
          >
            {getApiErrorMessage(
              error,
              "Unable to load documents."
            )}
          </p>
        )}


        {!isLoading
          && !isError
          && documents.length
          === 0 && (
          <div
            className="
              mt-5
              rounded-lg
              border
              border-dashed
              border-slate-200
              p-8
              text-center
            "
          >
            <FileText
              className="
                mx-auto
                h-8
                w-8
                text-slate-400
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-slate-500
              "
            >
              No medical documents uploaded yet.
            </p>
          </div>
        )}


        <div
          className="
            mt-5
            space-y-3
          "
        >
          {documents.map(
            (
              document
            ) => (
              <article
                key={
                  document.id
                }
                className="
                  flex
                  flex-col
                  gap-4
                  rounded-lg
                  border
                  border-slate-200
                  p-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-sky-50
                      text-sky-600
                    "
                  >
                    <FileText
                      className="h-5 w-5"
                    />
                  </div>


                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        truncate
                        font-semibold
                        text-slate-900
                      "
                    >
                      {
                        document.filename
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      {formatDocumentType(
                        document.document_type
                      )}
                      {" • "}
                      {formatBytes(
                        document.size_bytes
                      )}
                      {" • "}
                      {formatDate(
                        document.created_at
                      )}
                    </p>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={() =>
                    downloadMedicalDocument(
                      document
                    )
                  }
                  className="
                    inline-flex
                    min-h-[40px]
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-700

                    hover:bg-slate-50
                  "
                >
                  <Download
                    className="h-4 w-4"
                  />

                  Download
                </button>
              </article>
            )
          )}
        </div>
      </section>
    </div>
  );
}