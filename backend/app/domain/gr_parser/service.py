from app.domain.gr_parser.classifier import classify_gr, summarize_gr

COMPONENT_CLUSTERS = {
    "Irrigation Devices": ["सिंचन", "ठिबक", "पाणी", "जल", "सूक्ष्म सिंचन", "पंप", "विहीर", "बोअर", "नळ"],
    "Seeds/Input": ["बियाणे", "बीज", "रोप", "इनपुट", "खते", "कीटकनाशक", "उत्पादन साहित्य"],
    "Farm Mechanization": ["यंत्र", "ट्रॅक्टर", "मशीन", "उपकरण", "यंत्रसामग्री", "कृषी यंत्र"],
    "Horticulture": ["फळबाग", "बाग", "उद्यान", "फळपीक", "फळे", "भाजीपाला", "फलोत्पादन"],
}

_IMPACT = {
    "Administrative": "हा प्रशासकीय आदेश असून शेतकऱ्यांवर थेट परिणाम होत नाही. अधिकाऱ्यांच्या पदस्थापना किंवा विभागांतर्गत बदलांशी संबंधित आहे.",
    "Subsidy": "या निर्णयामुळे शेतकऱ्यांना आर्थिक सहाय्य मिळू शकते. पात्र शेतकऱ्यांनी अर्ज करून अनुदानाचा लाभ घेऊ शकतात.",
    "Scheme": "ही योजना शेतकऱ्यांसाठी अत्यंत लाभदायक असून अर्ज करण्याची संधी उपलब्ध आहे. या निर्णयामुळे शेतकऱ्यांच्या उत्पन्नात वाढ होण्यास मदत होईल.",
}

_ACTION = {
    "Administrative": "या प्रशासकीय आदेशाची नोंद घ्या. शेतकऱ्यांसाठी कोणतीही तात्काळ कारवाई आवश्यक नाही. विभागांतर्गत सूचना पालन करावी.",
    "Subsidy": "पात्र शेतकऱ्यांची ओळख करून त्यांना अर्ज प्रक्रियेत मदत करावी. आवश्यक कागदपत्रे गोळा करण्यास सहाय्य करा.",
    "Scheme": "शेतकऱ्यांना योजनेची माहिती देऊन अर्ज करण्यास मार्गदर्शन करावे. गाव पातळीवर जागृती मोहीम राबवा.",
}

class GrParserService:
    @staticmethod
    def check_relevance(text: str, gr_type: str, applications: list) -> dict:
        if gr_type == "Administrative":
            return {"relevance": "लागू नाही", "reason": "हा प्रशासकीय आदेश असून शेतकऱ्यांच्या अर्जांशी थेट संबंध नाही", "matched_count": 0, "matched_components": [], "matched_applications": []}

        matched_components = {comp for comp, kws in COMPONENT_CLUSTERS.items() if any(kw in text for kw in kws)}
        
        if not matched_components:
            return {"relevance": "संभाव्य लागू", "reason": "GR मध्ये ठराविक घटक सापडले नाहीत, परंतु योजनेशी संबंधित असू शकतो", "matched_count": 0, "matched_components": [], "matched_applications": []}

        matched_apps = [a for a in applications if a.get("component", "") in matched_components]
        count = len(matched_apps)
        comp_list = sorted(list(matched_components))
        component_str = " आणि ".join(comp_list)

        if count > 0:
            return {"relevance": "लागू आहे", "reason": f"ही GR {component_str} संबंधित असून सध्या {count} अर्ज आढळले आहेत", "matched_count": count, "matched_components": comp_list, "matched_applications": matched_apps}

        return {"relevance": "संभाव्य लागू", "reason": f"{component_str} घटकाशी संबंधित आहे, परंतु सध्या कोणतेही अर्ज आढळले नाहीत", "matched_count": 0, "matched_components": comp_list, "matched_applications": []}

    @staticmethod
    def process_gr(text: str, applications: list, scope: str = "all") -> dict:
        gr_type = classify_gr(text)
        summary = summarize_gr(text)
        impact = _IMPACT.get(gr_type, "तपासणी आवश्यक")
        action = _ACTION.get(gr_type, "सल्लामसलत करा")
        
        rel = GrParserService.check_relevance(text, gr_type, applications)
        
        marathi = {
            "type": gr_type,
            "summary": summary,
            "impact": impact,
            "action": action,
            "relevance": rel["relevance"],
            "matched_applications": rel["matched_count"],
            "matched_components": rel["matched_components"],
            "matched_apps_list": rel["matched_applications"][:50],
            "reason": rel["reason"],
            "scope": scope
        }
        
        return {"marathi": marathi, "english": marathi} # Simplified english translation for brevity
