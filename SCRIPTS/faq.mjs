#!/usr/bin/env node

/**
 * The practice's own questions and answers, recovered from the WordPress
 * export where they existed only as invisible FAQPage markup across twelve
 * pages — content Google treats as hidden and does not credit.
 *
 * All sixty-seven are rendered as visible page content, and the FAQPage
 * markup is generated from this same source, so the two cannot disagree.
 * check-site.mjs fails the build if they ever do.
 *
 * These are the practice's claims about its own fees, insurance, records
 * handling and treatment. When any of them stops being true, edit it here —
 * the page copy and the structured data both follow from this file.
 */

export const FAQ = Object.freeze({
  "/": [
    { q: "What types of therapy do you offer?", a: "We offer evidence-based therapies including Cognitive Behavioral Therapy (CBT), EMDR for trauma, Gottman Method for couples, Dialectical Behavior Therapy (DBT), mindfulness-based therapy, and Emotional Freedom Technique (EFT). We specialize in treating depression, anxiety, trauma, and relationship issues." },
    { q: "How much do therapy sessions cost?", a: "Individual therapy sessions start at $150 for 50 minutes, and couples therapy sessions are $160 for 60 minutes. We offer a free 15-minute phone consultation to discuss your needs and determine if we&#8217;re a good fit." },
    { q: "Do you accept insurance?", a: "Yes, we accept most major insurance plans. We also accept cash, credit cards, and debit cards. Please contact us to verify your specific insurance coverage." },
    { q: "Do you offer telehealth sessions?", a: "Yes, we offer secure telehealth sessions for clients who prefer virtual therapy or are unable to attend in-person sessions. Our telehealth platform is HIPAA-compliant and easy to use." },
    { q: "How do I schedule an appointment?", a: "You can schedule an appointment by calling us at (541) 363-8817 or emailing elaine@adultstherapy.com. We&#8217;ll start with a free 15-minute consultation to discuss your needs and answer any questions you may have." },
    { q: "What should I expect in my first session?", a: "Your first session will be an initial consultation where we&#8217;ll discuss your concerns, goals for therapy, and develop a treatment plan. We&#8217;ll also review policies, answer questions, and ensure we&#8217;re a good fit for working together." },
  ],
  "/about/": [
    { q: "What are Elaine&#8217;s qualifications and experience?", a: "Elaine Dinwiddie is a Licensed Professional Counselor (LPC) in Oregon with a Master&#8217;s degree from Liberty University. She holds certifications in Gottman Method Couples Therapy Level 2, EMDR Level 2, and is a Certified Clinical Trauma Professional (CCTP I). She has extensive experience treating depression, anxiety, trauma, and relationship issues." },
    { q: "What therapeutic approaches does Elaine use?", a: "Elaine uses evidence-based approaches including Cognitive Behavioral Therapy (CBT), EMDR for trauma, Gottman Method for couples, Dialectical Behavior Therapy (DBT), mindfulness-based therapy, and Emotional Freedom Technique (EFT). She specializes in trauma-informed care and military trauma therapy." },
    { q: "Does Elaine work with military personnel and veterans?", a: "Yes, Elaine has specialized training and experience working with military personnel, veterans, and their families. She understands military culture and the unique challenges of military service, including PTSD, combat trauma, and deployment-related issues." },
    { q: "What insurance plans does Elaine accept?", a: "Elaine accepts CIGNA, Moda, CHA, TriWest, Atrio, and other major insurance plans. She also works with military insurance (TRICARE) and can help you navigate veterans&#8217; benefits. Please contact us to verify your specific insurance coverage." },
    { q: "Does Elaine offer telehealth sessions?", a: "Yes, Elaine offers secure telehealth sessions for clients who prefer virtual therapy or are unable to attend in-person sessions. Her telehealth platform is HIPAA-compliant and easy to use, making therapy accessible regardless of your location in Oregon." },
    { q: "How do I schedule an appointment with Elaine?", a: "You can schedule an appointment by calling (541) 363-8817 or emailing elaine@adultstherapy.com. Elaine offers a free 15-minute phone consultation to discuss your needs, answer questions, and determine if she&#8217;s the right therapist for you." },
  ],
  "/education/": [
    { q: "What educational resources do you provide?", a: "We provide educational resources about mental health, neuroscience basics, brain models, the sympathetic nervous system, and therapeutic techniques. These resources help you better understand yourself and improve your emotional well-being." },
    { q: "Why is understanding neuroscience important for mental health?", a: "Understanding neuroscience helps you recognize how your brain and nervous system respond to stress, anxiety, and other emotions. This knowledge empowers you to better manage your mental health and make informed decisions about your well-being." },
    { q: "Are these educational resources free?", a: "Yes, our educational resources are freely available to help increase mental health awareness and understanding. We believe that education is a powerful tool for improving mental health outcomes." },
    { q: "How can I use these educational resources?", a: "You can use these resources to better understand your mental health, learn about therapeutic techniques, and gain insights into how your brain works. They&#8217;re designed to complement therapy sessions and support your mental health journey." },
    { q: "Do you provide resources for specific mental health conditions?", a: "Our educational resources cover general mental health topics, neuroscience basics, and therapeutic techniques. For specific conditions, we recommend consulting with a mental health professional who can provide personalized guidance and treatment." },
    { q: "How often do you update your educational resources?", a: "We regularly update our educational resources to reflect the latest research and best practices in mental health and therapy. We&#8217;re committed to providing accurate, up-to-date information to support your mental health journey." },
  ],
  "/privacy/": [
    { q: "How do you protect my privacy?", a: "We are committed to protecting your privacy and maintaining the confidentiality of your personal information. We follow HIPAA guidelines and use secure, encrypted systems for all communications and data storage. Your information is never shared without your explicit consent." },
    { q: "What information do you collect?", a: "We collect only the information necessary to provide therapy services, including contact information, health history, and session notes. We do not collect unnecessary personal information and never sell or share your data with third parties for marketing purposes." },
    { q: "Are therapy sessions confidential?", a: "Yes, therapy sessions are confidential under HIPAA regulations. There are limited exceptions for safety concerns, such as if you or someone else is in immediate danger. We will discuss confidentiality in detail during your first session." },
    { q: "How do you handle telehealth privacy?", a: "Our telehealth platform is HIPAA-compliant and uses end-to-end encryption. We recommend using a private, secure location for telehealth sessions and ensuring no one else can overhear your conversations." },
    { q: "Can I request my records?", a: "Yes, you have the right to request copies of your therapy records. We will provide them within 30 days of your request, as required by HIPAA. There may be a small fee for copying and mailing records." },
    { q: "How long do you keep my information?", a: "We retain therapy records for at least 7 years as required by Oregon law and professional standards. After that time, records are securely destroyed. You can request deletion of your information at any time, subject to legal requirements." },
  ],
  "/skills/": [
    { q: "What therapeutic skills do you teach?", a: "We teach essential therapeutic skills including deep breathing exercises, mindfulness techniques, emotional regulation strategies, progressive muscle relaxation, and grounding techniques. These skills help manage stress, anxiety, and improve overall mental well-being." },
    { q: "How do deep breathing exercises help?", a: "Deep breathing exercises help improve your mind-body connection by bringing awareness to the normally unconscious act of breathing. They assist in controlling symptoms of stress, anxiety, and anger, providing near-immediate relief from uncomfortable symptoms." },
    { q: "Can I learn these skills on my own?", a: "While you can practice these skills independently, learning them with a trained therapist ensures proper technique and personalized guidance. We can help you develop a practice that works best for your specific needs and challenges." },
    { q: "How long does it take to see benefits from these skills?", a: "Many people experience immediate relief from deep breathing and grounding techniques. For lasting benefits, regular practice is recommended. Most clients notice significant improvements in stress management within 2-4 weeks of consistent practice." },
    { q: "Are these skills suitable for everyone?", a: "Yes, these therapeutic skills are generally safe and suitable for most people. They can be adapted for different abilities and needs. If you have specific health concerns, we can modify techniques to ensure they&#8217;re appropriate for your situation." },
    { q: "How do I get started learning these skills?", a: "You can start by scheduling a consultation with us. We&#8217;ll assess your needs and teach you the most appropriate skills for your situation. We also provide guidance on how to practice these skills at home between sessions." },
  ],
  "/terms/": [
    { q: "What are the terms of service for this website?", a: "Our terms of service outline the rules and guidelines for using our website and services. They cover website usage, intellectual property rights, disclaimers, and limitations of liability. By using our website, you agree to these terms." },
    { q: "How do I contact you about legal matters?", a: "For legal matters or questions about our terms of service, you can contact us at elaine@adultstherapy.com or call (541) 363-8817. We&#8217;re committed to addressing any concerns promptly and professionally." },
    { q: "Can I use content from this website?", a: "The content on this website is protected by copyright and intellectual property laws. You may not reproduce, distribute, or use our content without written permission. Educational use may be permitted with proper attribution." },
    { q: "What happens if I don&#8217;t agree to the terms?", a: "If you don&#8217;t agree to our terms of service, you should not use our website or services. Continued use of our website constitutes acceptance of these terms. We reserve the right to modify these terms at any time." },
    { q: "Are these terms legally binding?", a: "Yes, these terms of service are legally binding agreements between you and Adults and Couples Therapy of Oregon. They govern your use of our website and services and should be read carefully before using our site." },
  ],
  "/therapy/cbt/": [
    { q: "What is Cognitive Behavioral Therapy (CBT)?", a: "CBT is a form of psychological therapy that helps you identify and change negative thought patterns and behaviors that affect your emotions. It&#8217;s a goal-oriented approach that focuses on the present moment, rather than dwelling on the past." },
    { q: "How long does CBT treatment take?", a: "CBT is typically a short-term treatment, with most people seeing significant improvement in 12-20 weekly sessions. The exact duration depends on the individual and their specific concerns." },
    { q: "What conditions can CBT help with?", a: "CBT is effective for depression, anxiety disorders, panic attacks, phobias, obsessive-compulsive disorder, PTSD, eating disorders, and substance abuse. It&#8217;s one of the most researched and evidence-based forms of therapy." },
    { q: "What happens during a CBT session?", a: "Sessions typically last 50 minutes and involve discussing your thoughts, feelings, and behaviors. You&#8217;ll learn specific techniques to challenge negative thinking patterns and develop healthier coping strategies. Homework assignments are often given between sessions." },
    { q: "How much does CBT cost?", a: "Individual CBT sessions start at $150 for 50 minutes. We also offer a 15-minute complimentary phone consultation to discuss your needs and determine if CBT is right for you." },
  ],
  "/therapy/dbt/": [
    { q: "What is Dialectical Behavior Therapy (DBT)?", a: "DBT is a skills-based therapy that combines cognitive-behavioral techniques with mindfulness practices. It helps you learn to manage intense emotions, improve relationships, tolerate distress, and develop healthy coping strategies." },
    { q: "What are the four modules of DBT?", a: "DBT consists of four skill modules: Mindfulness (being present and aware), Distress Tolerance (coping with difficult situations), Emotion Regulation (managing intense emotions), and Interpersonal Effectiveness (improving relationships and communication)." },
    { q: "Who can benefit from DBT?", a: "DBT is effective for people struggling with intense emotions, relationship difficulties, self-harm behaviors, and emotional dysregulation. It&#8217;s particularly helpful for those with borderline personality disorder, but benefits many others as well." },
    { q: "How long does DBT treatment take?", a: "DBT typically involves 6-12 months of treatment, with weekly individual sessions and skills training. The exact duration depends on your specific needs and goals. Many people begin to see improvements within the first few months." },
    { q: "What happens during a DBT session?", a: "Sessions focus on learning and practicing specific skills, reviewing homework assignments, and applying DBT techniques to real-life situations. You&#8217;ll receive practical tools to use in your daily life." },
  ],
  "/therapy/eft/": [
    { q: "What is Emotional Freedom Technique (EFT)?", a: "EFT is an evidence-based energy psychology technique that combines acupressure with modern psychology. It involves gentle tapping on specific meridian points while focusing on emotional issues, helping to release emotional and physical pain, trauma, and negative patterns." },
    { q: "How does EFT work?", a: "EFT works by stimulating meridian points through gentle tapping while you focus on specific emotional issues. This combination helps to release emotional blockages, reduce stress hormones, and reprogram the brain&#8217;s response to triggers. It&#8217;s based on the principles of acupuncture but without needles." },
    { q: "What conditions can EFT help with?", a: "EFT is effective for trauma, PTSD, anxiety, depression, chronic pain, phobias, addictions, emotional distress, and stress-related conditions. It&#8217;s particularly powerful for addressing deep-seated emotional issues and can provide rapid relief from symptoms." },
    { q: "How long does EFT treatment take?", a: "Many clients experience significant relief within 1-6 sessions. EFT can provide immediate relief for some issues, while deeper trauma work may require more sessions. You&#8217;ll also learn self-tapping techniques to use at home between sessions." },
    { q: "Is EFT safe?", a: "Yes, EFT is very safe. It&#8217;s a gentle, non-invasive technique that doesn&#8217;t involve any medications or physical manipulation. It&#8217;s suitable for people of all ages and can be used alongside other therapies. There are no known side effects." },
    { q: "How much does EFT therapy cost?", a: "Individual EFT sessions start at $150 for 50 minutes. We offer a free 15-minute phone consultation to discuss your needs and determine if EFT is right for you." },
  ],
  "/therapy/emdr/": [
    { q: "What is EMDR therapy?", a: "EMDR (Eye Movement Desensitization and Reprocessing) is an evidence-based psychotherapy treatment that uses bilateral stimulation, typically guided eye movements, to help individuals process traumatic memories and reduce the emotional impact of trauma." },
    { q: "How does EMDR work?", a: "EMDR works by stimulating both sides of the brain through guided eye movements or other bilateral stimulation while you focus on traumatic memories. This helps the brain naturally process and integrate the traumatic experience, reducing its emotional charge." },
    { q: "What conditions can EMDR treat?", a: "EMDR is particularly effective for PTSD, trauma, anxiety disorders, depression related to trauma, phobias, panic disorder, and various trauma-related conditions. It&#8217;s recognized by the American Psychological Association and World Health Organization as a treatment for PTSD." },
    { q: "How long does EMDR treatment take?", a: "Most clients experience significant improvement within 6-12 EMDR sessions. The exact number depends on the complexity of the trauma and individual response to treatment. Sessions are typically 50 minutes each." },
    { q: "Is EMDR safe?", a: "Yes, EMDR is very safe when conducted by a trained professional. It&#8217;s a non-invasive treatment that doesn&#8217;t require medication or detailed verbal recounting of traumatic events. The process is closely monitored and can be stopped at any time." },
    { q: "How much does EMDR therapy cost?", a: "Individual EMDR sessions start at $150 for 50 minutes. We offer a free 15-minute phone consultation to discuss your needs and determine if EMDR is appropriate for you." },
  ],
  "/therapy/gottman/": [
    { q: "What is the Gottman Method?", a: "The Gottman Method is an evidence-based approach to couples therapy developed by Drs. John and Julie Gottman. It&#8217;s based on over 40 years of research and focuses on building strong, healthy relationships through specific interventions and techniques." },
    { q: "How is Gottman Method different from other couples therapy?", a: "The Gottman Method is unique because it&#8217;s based on extensive research with thousands of couples. It uses specific assessment tools, interventions, and techniques that have been scientifically proven to improve relationship satisfaction and reduce divorce rates." },
    { q: "How long does Gottman Method therapy take?", a: "Most couples see significant improvement within 12-20 sessions. The exact duration depends on the specific issues and goals of the couple. We start with a comprehensive assessment to create a personalized treatment plan." },
    { q: "What happens during a Gottman Method session?", a: "Sessions typically last 60 minutes and involve both partners. We use research-based interventions to improve communication, build friendship, manage conflicts, and create shared meaning in your relationship." },
    { q: "How much do couples therapy sessions cost?", a: "Couples therapy sessions are $160 for 60 minutes. We also offer a free 15-minute phone consultation to discuss your relationship goals and determine if the Gottman Method is right for you." },
  ],
  "/therapy/talk-therapy/": [
    { q: "What is talk therapy?", a: "Talk therapy is a traditional form of psychotherapy that provides a safe, supportive environment to explore your thoughts, feelings, and experiences. It helps you gain insight, develop coping skills, and work through life challenges." },
    { q: "What can I expect in talk therapy sessions?", a: "Sessions typically last 50 minutes and involve open conversation about your concerns, goals, and experiences. The therapist provides support, guidance, and helps you develop new perspectives and coping strategies." },
    { q: "How long does talk therapy take?", a: "The duration varies depending on your goals and needs. Some people benefit from short-term therapy (8-12 sessions), while others prefer longer-term work for deeper personal growth. We&#8217;ll work together to determine what&#8217;s right for you." },
    { q: "What issues can talk therapy help with?", a: "Talk therapy can help with depression, anxiety, relationship issues, life transitions, grief, stress, personal growth, and many other concerns. It&#8217;s a versatile approach that can be adapted to your specific needs." },
    { q: "How do I know if talk therapy is right for me?", a: "Talk therapy is right for you if you&#8217;re looking for a safe space to explore your thoughts and feelings, want to develop better coping skills, or are going through life challenges. We offer a free consultation to help you decide." },
  ],
});
