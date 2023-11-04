from transformers import pipeline

ner_pipeline = pipeline("ner", model="CyberPeace-Institute/SecureBERT-NER")

text = "Microsoft Threat Intelligence analysts assess with high confidence that the malware, which we call KingsPawn, is developed by DEV-0196 and therefore strongly linked to QuaDream. We assess with medium confidence that the mobile malware we associate with DEV-0196 is part of the system publicly discussed as REIGN."

ner_results = ner_pipeline(text)

print(ner_results)