import {
  Construction,
} from "lucide-react";

import ClinicalCard from "@/components/common/ClinicalCard";
import PageHeader from "@/components/common/PageHeader";


export default function PlaceholderPage({
  title,
  description,
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
      />

      <ClinicalCard className="p-8">
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-sky-50
              text-sky-600
            "
          >
            <Construction
              className="h-6 w-6"
            />
          </div>

          <h2
            className="
              mt-4
              text-base
              font-semibold
              text-slate-900
            "
          >
            Module foundation ready
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-500
            "
          >
            This module will be implemented
            in its dedicated development
            phase.
          </p>
        </div>
      </ClinicalCard>
    </div>
  );
}