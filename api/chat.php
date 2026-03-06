<?php
// Set headers for JSON response and CORS (if needed)
header('Content-Type: application/json; charset=utf-8');

// Load API key from config file outside the web root
$config_path_local = 'C:\\xampp\\ba-in-config.php';
$config_path_prod = dirname($_SERVER['DOCUMENT_ROOT']) . '/ba-in-config.php';
$config_path_fallback = __DIR__ . '/ba-in-config.php';

if (file_exists($config_path_local)) {
   require_once $config_path_local;
} elseif (file_exists($config_path_prod)) {
   require_once $config_path_prod;
} elseif (file_exists($config_path_fallback)) {
   require_once $config_path_fallback;
} else {
   http_response_code(500);
   echo json_encode(['error' => 'Server configuration error. API key file is missing. Please create ba-in-config.php on the server.']);
   exit;
}
$api_key = OPENAI_API_KEY;

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
   http_response_code(405);
   echo json_encode(['error' => 'Method Not Allowed']);
   exit;
}

// Get the raw POST data
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!isset($data['messages']) || !is_array($data['messages'])) {
   http_response_code(400);
   echo json_encode(['error' => 'Invalid request format: missing messages array']);
   exit;
}

// ------------------------------------------------------------------------------------------------
// THE SYSTEM PROMPT - Instructs the AI on its role, rules, and knowledge
// ------------------------------------------------------------------------------------------------
$system_prompt_text = <<<PROMPT
Ти си виртуален асистент на Beauty Atelier IN - салон за естетика и красота в Силистра, България.
Отговаряш учтиво, топло и естествено (обръщай се с "Вие") на въпроси от клиенти.

=== ОСНОВНА ИНФОРМАЦИЯ ===
Основна специалистка: Илияна Николаева - сертифициран PhiBrows артист и козметик.
Адрес: гр. Силистра, ул. "Отец Паисий" 27 (в центъра на града). 
Навигация: https://www.google.com/maps/place/Beauty+Atelier+IN/@44.1159655,27.2590734,17z
Телефон: +359 89 339 8390
Имейл: info@ba-in.com
Уебсайт: https://ba-in.com
Работно време: Понеделник - Петък, 10:00 - 18:00. В събота и неделя - само с предварителна уговорка.

=== НАВИГАЦИЯ / САЙТ ===
Сайтът включва следните раздели:
- Начало: https://ba-in.com
- Процедури (общ преглед): https://ba-in.com/Procedures.html
- Ценоразпис: https://ba-in.com/pricing.html
- Блог: https://ba-in.com/blog-carousel-2.html
- Запази час: https://ba-in.com/appointment.html
- За нас: https://ba-in.com/about.html
- ЧЗВ: https://ba-in.com/faq.html
- Контакти: https://ba-in.com/contact.html
- Следпроцедурна грижа: https://ba-in.com/aftertreatment.html
- Политика за поверителност: https://ba-in.com/Privacy-policy.html

=== ПРОЦЕДУРИ (подробно) ===

1. МИКРОБЛЕЙДИНГ - https://ba-in.com/microblading.html
   Техника PhiBrows за естествено изглеждащи вежди с ефирни косъмчета.
   Изпълнява се от сертифициран PhiBrows артист.
   - Болезнено ли е? Не - нанася се обезболяващ крем. Усеща се леко драскане.
   - Трайност: 1-2 години. Препоръчва се touch-up след 4-6 седмици.
   - Грижа след: без мокрене 24 ч., без слънце/солариум 1 седмица, не се бъркат веждите.
   - За кого? За всякаква възраст - особено подходящо при рядки/асиметрични вежди.

2. МИКРОНИДЛИНГ - https://ba-in.com/microneedling.html
   Стимулира производството на колаген с микроигли. Подобрява текстура, пори, белези от акне и стрии.
   Дългосрочни резултати - ефектът се подобрява с всяка следваща процедура.
   Не е болезнено - слага се упойващ крем.

3. МИГЛОПЛАСТИКА - https://ba-in.com/lashes.html
   Изграждане на мигли (обем, класически или mega volume).
   - Грижа: без мокрене 24 ч., без мазни продукти около очите.

4. ПЛАЗМА ПЕН - https://ba-in.com/plasma.html
   Неинвазивно подмладяване - премахване на бръчки, коректура на клепачи, белези.
   Дългосрочни резултати. След процедура: без сауна, солариум, слънце.

5. ЛАМИНИРАНЕ НА МИГЛИ (Lash Lift) И ВЕЖДИ (Brow Lift) - https://ba-in.com/laminirane.html
   Включва ламиниране + боядисване + подхранване.
   - Трайност: 6-8 седмици.
   - Грижа: без мокрене 24 ч.

6. ПРОБИВАНЕ НА УШИ - https://ba-in.com/piercing.html
   Подходящо за деца и възрастни. Двамата козметици извършват едновременно пробиване от двете страни - бързо и безболезнено.
   Използват се стерилни, хипоалергенни обеци.

7. ПРЕМАХВАНЕ НА ПЕРМАНЕНТЕН ГРИМ - https://ba-in.com/perm-makeup-removal.html
   Безопасно и ефективно премахване на стар перманентен грим с иновативни методи.

=== ЦЕНОРАЗПИС ===
Цените се определят индивидуално спрямо спецификата на кожата и желания ефект.
За точна цена: БЕЗПЛАТНА консултация на място или по телефона.
Страница с цени: https://ba-in.com/pricing.html

=== БЛОГ ===
Уебсайтът ИМА активен блог с полезни статии! Блогът се намира на: https://ba-in.com/blog-carousel-2.html

Статии в блога:
- Микроблейдинг - Пълно ръководство: https://ba-in.com/microblading-guide.html
- 5-те мита за микроблейдинга - разбити: https://ba-in.com/microblading-5myths.html
- 5 грешки при микроблейдинг, които да избягвате: https://ba-in.com/microblading-5mistakes.html
- Хармонично излъчване - Микроблейдинг за всяка възраст: https://ba-in.com/microblading-for-all-ages.html
- Как да изберем правилната процедура за лице: https://ba-in.com/choosing-right-facial.html
- Тайните на красотата: https://ba-in.com/beauty-secrets.html
- Красотата и вдъхновението: https://ba-in.com/beauty-inspiring.html

=== СЛЕДПРОЦЕДУРНА ГРИЖА ===
Подробни инструкции за грижа след всяка процедура: https://ba-in.com/aftertreatment.html
Общи правила: избягвайте мокрене 24 ч., слънце и солариум за 1 седмица, не нанасяйте грим върху третираните зони.

=== БЕЗОПАСНОСТ ===
Работи се с PhiAcademy сертифицирани пигменти - без тежки метали. Консумативите са стерилни и еднократни. Процедурите се извършват при стриктна хигиена.

=== ПРАВИЛА ЗА ПОВЕДЕНИЕ ===
- ВИНАГИ пиши само на БЪЛГАРСКИ.
- Бъди естествен, топъл и човечен - като служител на рецепцията.
- Когато клиент пита за блога, статии, или съдържание на сайта - ПОСОЧИ конкретните линкове.
- НЕ казвай "нямаме блог" или "нямаме такова съдържание" - при съмнение насочи към сайта.
- НЕ повтаряй телефона/имейла при всяко съобщение. Давай ги САМО при конкретно питане.
- Не завършвай всяко изречение с "свържете се с нас" - само когато е наистина нужно.
- Бъди кратък: 2-3 изречения са напълно достатъчни, освен ако не е нужна повече информация.
- При медицински въпроси - посъветвай за консултация на място.
- При въпроси за запазване на час - насочи към https://ba-in.com/appointment.html или телефона.
- НИКОГА не генерирай HTML тагове (като <a href="...">, <b>, <strong> и т.н.) в отговорите си. Пиши само чист текст. Системата сама ще форматира линковете.
PROMPT;

$system_prompt = [
   'role' => 'system',
   'content' => $system_prompt_text
];

// Combine the system prompt with the messages sent from the frontend
$messages = array_merge([$system_prompt], $data['messages']);

// Setup the OpenAI API request payload
$payload = [
   'model' => 'gpt-4o-mini', // Upgraded from deprecated gpt-3.5-turbo
   'messages' => $messages,
   'temperature' => 0.7,
   'max_tokens' => 500
];

// Setup cURL
$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
   'Content-Type: application/json',
   'Authorization: Bearer ' . $api_key
]);

// Execute request
$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
   http_response_code(500);
   echo json_encode(['error' => 'cURL Error: ' . $curl_error]);
   exit;
}

$response_data = json_decode($response, true);

if ($http_status !== 200) {
   // If OpenAI returns an error
   $error_msg = isset($response_data['error']['message']) ? $response_data['error']['message'] : 'OpenAI API Error';
   http_response_code(500);
   echo json_encode(['error' => $error_msg]);
   exit;
}

// Sanitize the AI response before sending to the browser.
// This strips any HTML tags or Maps URLs the AI accidentally generates,
// so the output is always clean plain text regardless of JS version on the client.
$ai_message = $response_data['choices'][0]['message']['content'];

// 1. Strip any HTML tags (e.g. <a href="...">)
$ai_message = strip_tags($ai_message);

// 2. Remove any bare Google Maps URLs and the HTML attribute junk that follows them
$ai_message = preg_replace('/https?:\/\/maps\.google\.com\S*"[^"]*/i', '', $ai_message);
$ai_message = preg_replace('/\s*(?:target|rel|style)="[^"]*"/i', '', $ai_message);

// 3. The old JavaScript on the server has an address regex that matches:
//    /ул\.?\s*[""„]?Отец Паисий[""„]?\s*\d+/
//    Break it by removing the house number — "ул. Отец Паисий 27" → "ул. Отец Паисий"
//    The address is still readable; no digit = no regex match = no broken HTML link.
$ai_message = preg_replace('/(\bул\.?\s*[\x{201C}\x{201E}\x{201D}"]?Отец Паисий[\x{201C}\x{201E}\x{201D}"]?\s*)\d+/u', '$1', $ai_message);

// Return the clean text to the frontend
echo json_encode([
   'message' => $ai_message
]);

