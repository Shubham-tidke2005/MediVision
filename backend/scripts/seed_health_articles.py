from datetime import (
    datetime,
    timezone,
)

from sqlalchemy import (
    select,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    engine,
)

from app.models.health_article import (
    HealthArticle,
)


PROFESSIONAL_NOTE = (
    "This information is for general health education "
    "only. It does not provide a diagnosis or replace "
    "individual advice from a qualified healthcare "
    "professional."
)


ARTICLES = [
    {
        "category":
            "DIABETES_PREVENTION",

        "slug":
            "everyday-habits-for-diabetes-prevention",

        "title":
            "Everyday Habits for Diabetes Prevention",

        "summary":
            (
                "Learn about general lifestyle habits "
                "that may support long-term metabolic "
                "health and help reduce the risk of "
                "type 2 diabetes."
            ),

        "content":
            (
                "Type 2 diabetes risk is influenced by "
                "many factors, including family history, "
                "age, activity, body composition and "
                "everyday lifestyle habits.\n\n"
                "Regular movement, balanced meals, "
                "adequate sleep and routine preventive "
                "care can support overall health. Food "
                "choices can focus on vegetables, whole "
                "grains, legumes, appropriate protein "
                "sources and less frequent consumption "
                "of highly processed foods and sugary "
                "drinks.\n\n"
                "People with increased risk may benefit "
                "from discussing appropriate blood sugar "
                "testing with a healthcare professional. "
                "Screening needs vary between individuals."
            ),

        "key_points": [
            "Include regular physical activity in daily life.",
            "Choose balanced meals with vegetables, whole grains and appropriate protein sources.",
            "Limit frequent intake of sugary drinks and highly processed foods.",
            "Maintain regular sleep and general wellness habits.",
            "Discuss appropriate screening with a healthcare professional when relevant.",
        ],

        "is_featured":
            True,
    },

    {
        "category":
            "HYPERTENSION_AWARENESS",

        "slug":
            "understanding-blood-pressure-and-healthy-habits",

        "title":
            "Understanding Blood Pressure and Healthy Habits",

        "summary":
            (
                "Learn why blood pressure awareness "
                "matters and which everyday habits can "
                "support cardiovascular health."
            ),

        "content":
            (
                "Blood pressure describes the force of "
                "blood against artery walls. Persistent "
                "high blood pressure can occur without "
                "obvious symptoms, which is why routine "
                "measurement can be useful for preventive "
                "healthcare.\n\n"
                "General heart-healthy habits include "
                "regular physical activity, balanced "
                "meals, avoiding tobacco exposure, "
                "moderating excess dietary salt and "
                "maintaining healthy sleep habits.\n\n"
                "A single blood pressure reading does "
                "not by itself establish a diagnosis. "
                "Repeated measurements and professional "
                "assessment may be needed when readings "
                "are persistently unusual."
            ),

        "key_points": [
            "Blood pressure may be elevated without noticeable symptoms.",
            "Use an appropriate technique when measuring blood pressure.",
            "Regular movement and balanced eating support cardiovascular health.",
            "Avoid tobacco exposure.",
            "Persistent unusual readings should be discussed with a healthcare professional.",
        ],

        "is_featured":
            True,
    },

    {
        "category":
            "HEALTHY_DIET",

        "slug":
            "building-a-balanced-everyday-diet",

        "title":
            "Building a Balanced Everyday Diet",

        "summary":
            (
                "Understand the basic parts of a balanced "
                "everyday eating pattern."
            ),

        "content":
            (
                "A balanced diet does not require one "
                "perfect food or a rigid meal plan. "
                "Healthy eating patterns usually include "
                "a variety of vegetables, fruits, grains, "
                "protein sources and appropriate sources "
                "of healthy fats.\n\n"
                "Regular meals, adequate hydration and "
                "reasonable portion awareness can help "
                "support everyday wellbeing. Individual "
                "nutrition needs vary according to age, "
                "activity, health conditions and other "
                "factors.\n\n"
                "Therapeutic diets for medical conditions "
                "should be individualized rather than "
                "generated from general wellness advice."
            ),

        "key_points": [
            "Choose a variety of foods rather than relying on one food group.",
            "Include vegetables and fruits regularly.",
            "Choose appropriate protein sources.",
            "Prefer water as a regular hydration choice.",
            "Medical nutrition needs should be discussed with a qualified professional.",
        ],

        "is_featured":
            True,
    },

    {
        "category":
            "SLEEP",

        "slug":
            "building-healthy-sleep-habits",

        "title":
            "Building Healthy Sleep Habits",

        "summary":
            (
                "Simple habits can help support a more "
                "consistent and restful sleep routine."
            ),

        "content":
            (
                "Sleep supports physical recovery, "
                "attention, mood and general wellbeing. "
                "Sleep needs vary between people, but "
                "consistency is often an important part "
                "of a healthy routine.\n\n"
                "Helpful habits can include keeping "
                "regular sleep and wake times, creating "
                "a comfortable sleep environment and "
                "reducing stimulating activities close "
                "to bedtime.\n\n"
                "Persistent difficulty sleeping, loud "
                "snoring with breathing pauses, or "
                "significant daytime sleepiness may "
                "require professional assessment."
            ),

        "key_points": [
            "Try to keep a consistent sleep and wake schedule.",
            "Create a quiet and comfortable sleep environment.",
            "Reduce stimulating activities near bedtime.",
            "Avoid using sleep duration alone as a measure of health.",
            "Seek professional advice for persistent or concerning sleep problems.",
        ],

        "is_featured":
            False,
    },

    {
        "category":
            "EXERCISE",

        "slug":
            "staying-active-for-general-health",

        "title":
            "Staying Active for General Health",

        "summary":
            (
                "Regular movement can support physical "
                "function, cardiovascular health and "
                "overall wellbeing."
            ),

        "content":
            (
                "Physical activity can include walking, "
                "cycling, recreational activities, "
                "strength exercises, mobility work and "
                "many other forms of movement.\n\n"
                "A useful approach is to build activity "
                "gradually and choose forms of movement "
                "that are comfortable and sustainable. "
                "Long periods of inactivity can also be "
                "broken up with short movement breaks.\n\n"
                "Exercise recommendations should be "
                "adapted when a person has significant "
                "pain, mobility limitations, heart or "
                "breathing conditions, or other medical "
                "concerns."
            ),

        "key_points": [
            "Choose activity that is appropriate for your current ability.",
            "Increase activity gradually rather than suddenly.",
            "Walking and everyday movement can contribute to general activity.",
            "Include rest and recovery.",
            "Stop and seek appropriate help for concerning symptoms during activity.",
        ],

        "is_featured":
            False,
    },

    {
        "category":
            "VACCINATION",

        "slug":
            "understanding-vaccination-and-preventive-care",

        "title":
            "Understanding Vaccination and Preventive Care",

        "summary":
            (
                "Vaccination is one part of preventive "
                "healthcare, but appropriate vaccines "
                "depend on individual circumstances."
            ),

        "content":
            (
                "Vaccines are used to help the immune "
                "system prepare for specific infections. "
                "Vaccination recommendations are not the "
                "same for every person.\n\n"
                "Appropriate vaccination can depend on "
                "age, previous vaccination history, "
                "medical conditions, pregnancy, travel, "
                "occupation and local public-health "
                "guidance.\n\n"
                "For this reason, MediVision provides "
                "vaccination awareness rather than an "
                "automatic personalized vaccine schedule. "
                "A healthcare professional or official "
                "immunization program can provide "
                "individual guidance."
            ),

        "key_points": [
            "Vaccination is an important part of preventive healthcare.",
            "Recommended vaccines can vary by age and individual risk factors.",
            "Previous vaccination history matters.",
            "Travel and occupation can affect recommendations.",
            "Use professional or official public-health guidance for an individual vaccination schedule.",
        ],

        "is_featured":
            False,
    },

    {
        "category":
            "GENERAL_SCREENING",

        "slug":
            "why-routine-health-screening-matters",

        "title":
            "Why Routine Health Screening Matters",

        "summary":
            (
                "Preventive screening may help identify "
                "some health concerns before they cause "
                "obvious symptoms."
            ),

        "content":
            (
                "Health screening refers to tests or "
                "assessments used in people who may not "
                "have symptoms. Different screenings are "
                "appropriate for different populations.\n\n"
                "Screening decisions can depend on age, "
                "sex, family history, medical history, "
                "lifestyle, previous results and other "
                "risk factors. More testing is not always "
                "better, because tests can also produce "
                "false alarms or lead to unnecessary "
                "follow-up procedures.\n\n"
                "For this reason, MediVision does not "
                "automatically prescribe screening tests. "
                "Patients can use this section to learn "
                "why preventive care discussions are "
                "important."
            ),

        "key_points": [
            "Screening is intended for selected people who may not have symptoms.",
            "Appropriate screening varies by age and individual risk.",
            "Family and medical history can affect screening decisions.",
            "Not every test is appropriate for every person.",
            "Discuss individualized screening needs with a qualified healthcare professional.",
        ],

        "is_featured":
            False,
    },
]


def seed():
    now = datetime.now(
        timezone.utc
    )


    with Session(
        engine
    ) as db:

        for item in ARTICLES:
            article = db.scalar(
                select(
                    HealthArticle
                )
                .where(
                    HealthArticle.slug
                    == item[
                        "slug"
                    ]
                )
            )


            values = {
                "category":
                    item[
                        "category"
                    ],

                "title":
                    item[
                        "title"
                    ],

                "summary":
                    item[
                        "summary"
                    ],

                "content":
                    item[
                        "content"
                    ],

                "key_points_json":
                    item[
                        "key_points"
                    ],

                "professional_advice_note":
                    PROFESSIONAL_NOTE,

                "source_name":
                    None,

                "source_url":
                    None,

                "status":
                    "PUBLISHED",

                "is_featured":
                    item[
                        "is_featured"
                    ],

                "published_at":
                    now,
            }


            if article is None:
                article = HealthArticle(
                    slug=(
                        item[
                            "slug"
                        ]
                    ),

                    **values,
                )

                db.add(
                    article
                )

            else:
                for (
                    field,
                    value,
                ) in values.items():
                    setattr(
                        article,
                        field,
                        value,
                    )


        db.commit()


    print(
        "Health education articles seeded successfully."
    )


if __name__ == "__main__":
    seed()