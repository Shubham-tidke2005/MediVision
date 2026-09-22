import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileImage,
  Image as ImageIcon,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

import {
  screenMedicalImage,
} from "@/features/medicalImage/api/medicalImageApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


const MAX_FILE_BYTES =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];


function formatPercent(
  value
) {
  return (
    `${(
      Number(value)
      * 100
    ).toFixed(2)}%`
  );
}


function formatClassName(
  value
) {
  return value
    ?.replaceAll(
      "_",
      " "
    )
    ?.replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}


export default function MedicalImagePage() {
  const [
    file,
    setFile,
  ] = useState(null);

  const [
    disclaimerAccepted,
    setDisclaimerAccepted,
  ] = useState(false);

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const previewUrl =
    useMemo(
      () => (
        file
          ? URL.createObjectURL(
              file
            )
          : null
      ),
      [
        file,
      ]
    );


  useEffect(
    () => {
      return () => {
        if (
          previewUrl
        ) {
          URL.revokeObjectURL(
            previewUrl
          );
        }
      };
    },
    [
      previewUrl,
    ]
  );


  function clearResult() {
    setResult(
      null
    );

    setErrorMessage(
      ""
    );
  }


  function resetAll() {
    setFile(
      null
    );

    setDisclaimerAccepted(
      false
    );

    setResult(
      null
    );

    setErrorMessage(
      ""
    );
  }


  function handleFileChange(
    event
  ) {
    const selectedFile =
      event.target.files?.[0]
      ?? null;

    clearResult();

    if (
      !selectedFile
    ) {
      setFile(
        null
      );

      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {
      setFile(
        null
      );

      setErrorMessage(
        "Please select a JPG, JPEG or PNG image."
      );

      event.target.value =
        "";

      return;
    }

    if (
      selectedFile.size
      > MAX_FILE_BYTES
    ) {
      setFile(
        null
      );

      setErrorMessage(
        "Image must be 10 MB or smaller."
      );

      event.target.value =
        "";

      return;
    }

    setFile(
      selectedFile
    );
  }


  async function handleAnalyze(
    event
  ) {
    event.preventDefault();

    if (
      analyzing
    ) {
      return;
    }

    setErrorMessage(
      ""
    );

    setResult(
      null
    );

    if (!file) {
      setErrorMessage(
        "Please select a brain MRI image."
      );

      return;
    }

    if (
      !disclaimerAccepted
    ) {
      setErrorMessage(
        "Please accept the screening disclaimer before analysis."
      );

      return;
    }

    setAnalyzing(
      true
    );

    try {
      const data =
        await screenMedicalImage({
          file,
          disclaimerAccepted,
        });

      setResult(
        data
      );

    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to analyze this image."
        )
      );

    } finally {
      setAnalyzing(
        false
      );
    }
  }


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      {/* ==============================================
          PAGE HEADER
      ============================================== */}

      <section
        className="
          flex
          flex-col
          gap-4

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-sky-200

              bg-sky-50

              px-3
              py-1.5

              text-xs
              font-semibold
              text-sky-700
            "
          >
            <BrainCircuit
              className="
                h-4
                w-4
              "
            />

            Computer Vision
          </div>

          <h1
            className="
              mt-3

              text-2xl
              font-bold
              tracking-tight
              text-slate-900

              sm:text-3xl
            "
          >
            Medical Image Screening
          </h1>

          <p
            className="
              mt-2
              max-w-3xl

              text-sm
              leading-6
              text-slate-500
            "
          >
            Upload a supported brain MRI image for
            AI-assisted four-class screening using the
            MediVision ResNet18 model and Grad-CAM
            visualization.
          </p>
        </div>

        {result && (
          <button
            type="button"
            onClick={
              resetAll
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              gap-2

              rounded-xl

              border
              border-slate-200

              bg-white

              px-4

              text-sm
              font-semibold
              text-slate-700

              shadow-sm

              transition

              hover:bg-slate-50
            "
          >
            <RotateCcw
              className="
                h-4
                w-4
              "
            />

            New Screening
          </button>
        )}
      </section>


      {/* ==============================================
          GLOBAL SAFETY NOTICE
      ============================================== */}

      <section
        className="
          rounded-2xl

          border
          border-amber-200

          bg-amber-50

          p-4

          sm:p-5
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <AlertTriangle
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-amber-600
            "
          />

          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              AI-assisted screening only
            </h2>

            <p
              className="
                mt-1

                text-sm
                leading-6
                text-slate-600
              "
            >
              This feature is designed only for the
              project&apos;s supported brain MRI image
              classification task. It does not provide
              a final diagnosis and does not replace a
              radiologist, neurologist, neurosurgeon or
              other qualified clinician.
            </p>
          </div>
        </div>
      </section>


      {/* ==============================================
          UPLOAD + PREVIEW
      ============================================== */}

      {!result && (
        <form
          onSubmit={
            handleAnalyze
          }
          className="
            grid
            grid-cols-1
            gap-6

            xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]
          "
        >
          <section
            className="
              overflow-hidden

              rounded-2xl

              border
              border-slate-200

              bg-white

              shadow-sm
            "
          >
            <div
              className="
                border-b
                border-slate-100

                px-5
                py-4

                sm:px-6
              "
            >
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Upload brain MRI
              </h2>

              <p
                className="
                  mt-1

                  text-sm
                  text-slate-500
                "
              >
                Supported: JPG, JPEG, PNG • Maximum 10 MB
              </p>
            </div>

            <div
              className="
                p-5

                sm:p-6
              "
            >
              <label
                className="
                  group

                  flex
                  min-h-[260px]
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center

                  overflow-hidden

                  rounded-2xl

                  border-2
                  border-dashed
                  border-slate-200

                  bg-slate-50/70

                  p-5

                  text-center

                  transition

                  hover:border-blue-300
                  hover:bg-blue-50/40
                "
              >
                {previewUrl ? (
                  <img
                    src={
                      previewUrl
                    }
                    alt="Selected brain MRI preview"
                    className="
                      max-h-[360px]
                      w-full
                      rounded-xl
                      object-contain
                    "
                  />
                ) : (
                  <>
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center

                        rounded-2xl

                        bg-blue-50

                        text-blue-600
                      "
                    >
                      <UploadCloud
                        className="
                          h-7
                          w-7
                        "
                      />
                    </div>

                    <p
                      className="
                        mt-4

                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      Select a brain MRI image
                    </p>

                    <p
                      className="
                        mt-1

                        max-w-sm

                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      Choose an image from your device.
                      The original image is processed for
                      this screening request.
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={
                    handleFileChange
                  }
                  className="
                    sr-only
                  "
                />
              </label>

              {file && (
                <div
                  className="
                    mt-4

                    flex
                    items-center
                    gap-3

                    rounded-xl

                    border
                    border-slate-200

                    bg-white

                    p-3
                  "
                >
                  <FileImage
                    className="
                      h-5
                      w-5
                      shrink-0
                      text-blue-600
                    "
                  />

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        truncate

                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >
                      {file.name}
                    </p>

                    <p
                      className="
                        mt-0.5

                        text-xs
                        text-slate-500
                      "
                    >
                      {(
                        file.size
                        / 1024
                        / 1024
                      ).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>


          {/* ============================================
              DISCLAIMER
          ============================================ */}

          <section
            className="
              rounded-2xl

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
                h-11
                w-11
                items-center
                justify-center

                rounded-xl

                bg-emerald-50

                text-emerald-600
              "
            >
              <ShieldCheck
                className="
                  h-5
                  w-5
                "
              />
            </div>

            <h2
              className="
                mt-4

                font-semibold
                text-slate-900
              "
            >
              Screening disclaimer
            </h2>

            <div
              className="
                mt-3
                space-y-3

                text-sm
                leading-6
                text-slate-600
              "
            >
              <p>
                The model classifies the image into one
                of four project classes: Glioma,
                Meningioma, No Tumor, or Pituitary Tumor.
              </p>

              <p>
                The model score is not a clinical disease
                probability. Grad-CAM shows regions that
                influenced the model and does not prove
                tumor location.
              </p>
            </div>

            <label
              className="
                mt-5

                flex
                cursor-pointer
                items-start
                gap-3

                rounded-xl

                border
                border-slate-200

                bg-slate-50

                p-4
              "
            >
              <input
                type="checkbox"
                checked={
                  disclaimerAccepted
                }
                onChange={
                  (
                    event
                  ) => {
                    setDisclaimerAccepted(
                      event.target.checked
                    );

                    setErrorMessage(
                      ""
                    );
                  }
                }
                className="
                  mt-1
                  h-4
                  w-4

                  rounded

                  border-slate-300

                  text-blue-600

                  focus:ring-blue-600
                "
              />

              <span
                className="
                  text-sm
                  leading-6
                  text-slate-700
                "
              >
                I understand this is an AI-assisted
                screening result for the supported brain
                MRI task and is not a final diagnosis.
              </span>
            </label>

            {errorMessage && (
              <div
                className="
                  mt-4

                  rounded-xl

                  border
                  border-rose-200

                  bg-rose-50

                  px-4
                  py-3

                  text-sm
                  text-rose-700
                "
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={
                analyzing
                || !file
                || !disclaimerAccepted
              }
              className="
                mt-5

                inline-flex
                min-h-[46px]
                w-full
                items-center
                justify-center
                gap-2

                rounded-xl

                bg-blue-600

                px-4

                text-sm
                font-semibold
                text-white

                shadow-sm
                shadow-blue-600/20

                transition

                hover:bg-blue-700

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {analyzing ? (
                <>
                  <LoaderCircle
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Analyzing MRI...
                </>
              ) : (
                <>
                  <BrainCircuit
                    className="
                      h-4
                      w-4
                    "
                  />

                  Run AI-assisted Screening
                </>
              )}
            </button>
          </section>
        </form>
      )}


      {/* ==============================================
          RESULT
      ============================================== */}

      {result && (
        <div
          className="
            space-y-6
          "
        >
          <section
            className="
              overflow-hidden

              rounded-2xl

              border
              border-slate-200

              bg-white

              shadow-sm
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4

                border-b
                border-slate-100

                px-5
                py-5

                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
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
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    bg-blue-50

                    text-blue-600
                  "
                >
                  <CheckCircle2
                    className="
                      h-5
                      w-5
                    "
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-blue-600
                    "
                  >
                    AI-assisted screening result
                  </p>

                  <h2
                    className="
                      mt-1

                      text-xl
                      font-bold
                      text-slate-900
                    "
                  >
                    {result.possible_class_label}
                  </h2>
                </div>
              </div>

              <div
                className="
                  rounded-xl

                  border
                  border-sky-200

                  bg-sky-50

                  px-4
                  py-3
                "
              >
                <p
                  className="
                    text-xs
                    font-medium
                    text-sky-700
                  "
                >
                  Model score
                </p>

                <p
                  className="
                    mt-0.5

                    text-xl
                    font-bold
                    text-sky-800
                  "
                >
                  {formatPercent(
                    result.model_score
                  )}
                </p>
              </div>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-6

                p-5

                sm:p-6

                xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]
              "
            >
              {/* GRAD-CAM */}

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <ImageIcon
                    className="
                      h-5
                      w-5
                      text-sky-600
                    "
                  />

                  <h3
                    className="
                      font-semibold
                      text-slate-900
                    "
                  >
                    Grad-CAM visualization
                  </h3>
                </div>

                <div
                  className="
                    mt-3

                    overflow-hidden

                    rounded-2xl

                    border
                    border-slate-200

                    bg-slate-950
                  "
                >
                  <img
                    src={
                      result.gradcam_overlay_data_url
                    }
                    alt="Grad-CAM visualization of the uploaded brain MRI"
                    className="
                      mx-auto
                      max-h-[620px]
                      w-full
                      object-contain
                    "
                  />
                </div>

                <p
                  className="
                    mt-3

                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  {result.gradcam_notice}
                </p>
              </div>


              {/* DETAILS */}

              <div
                className="
                  space-y-4
                "
              >
                <article
                  className="
                    rounded-2xl

                    border
                    border-slate-200

                    bg-slate-50/70

                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Possible class
                  </p>

                  <p
                    className="
                      mt-2

                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    {result.possible_class_label}
                  </p>

                  <p
                    className="
                      mt-2

                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    This is the model&apos;s classification
                    output, not a confirmed diagnosis.
                  </p>
                </article>


                <article
                  className="
                    rounded-2xl

                    border
                    border-slate-200

                    bg-white

                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Stethoscope
                      className="
                        h-4
                        w-4
                        text-teal-600
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      Suggested specialty
                    </p>
                  </div>

                  <p
                    className="
                      mt-2

                      text-sm
                      text-slate-700
                    "
                  >
                    {result.suggested_specialty}
                  </p>

                  <p
                    className="
                      mt-2

                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Specialist suggestions support
                    follow-up planning and do not establish
                    a diagnosis.
                  </p>
                </article>


                <article
                  className="
                    rounded-2xl

                    border
                    border-slate-200

                    bg-white

                    p-4
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    Class scores
                  </p>

                  <div
                    className="
                      mt-3
                      space-y-3
                    "
                  >
                    {result.class_scores
                      ?.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.class_name
                            }
                          >
                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3

                                text-xs
                              "
                            >
                              <span
                                className="
                                  font-medium
                                  text-slate-600
                                "
                              >
                                {
                                  item.display_label
                                  || formatClassName(
                                    item.class_name
                                  )
                                }
                              </span>

                              <span
                                className="
                                  font-semibold
                                  text-slate-800
                                "
                              >
                                {formatPercent(
                                  item.score
                                )}
                              </span>
                            </div>

                            <div
                              className="
                                mt-1.5
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-slate-100
                              "
                            >
                              <div
                                className="
                                  h-full
                                  rounded-full
                                  bg-blue-600
                                "
                                style={{
                                  width:
                                    `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        Number(
                                          item.score
                                        )
                                        * 100
                                      )
                                    )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                  </div>

                  <p
                    className="
                      mt-4

                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    {result.model_score_notice}
                  </p>
                </article>
              </div>
            </div>
          </section>


          {/* ============================================
              FINAL SAFETY MESSAGE
          ============================================ */}

          <section
            className="
              rounded-2xl

              border
              border-amber-200

              bg-amber-50

              p-5
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <AlertTriangle
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-amber-600
                "
              />

              <div>
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Safety message
                </h3>

                <p
                  className="
                    mt-1

                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  {result.safety_message}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
