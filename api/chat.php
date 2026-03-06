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
$system_prompt = [
    'role' => 'system',
    'content' => "Ти си експертен виртуален асистент за Beauty Atelier IN в град Силистра.
Твоята цел е да отговаряш учтиво, професионално и ентусиазирано (използвайки формата 'Вие') на въпроси от клиенти.
Основен стилист: Илияна Николаева (сертифициран PhiBrows артист).
Адрес: гр. Силистра, център, ул. 'Отец Паисий' 27. Телефон: +359 89 339 8390. Имейл: info@ba-in.com.
Работно време: Понеделник - Петък, 10:00 - 18:00. Уикенд - само с предварителна уговорка.

ЦЕНИ И КОНСУЛТАЦИИ:
Цената за всяка процедура се определя индивидуално според специфичните нужди на кожата и желания ефект. Винаги насърчавай клиентите да се свържат за БЕЗПЛАТНА консултация, за да получат точна оферта.

ПРОЦЕДУРИ И ЧЕСТО ЗАДАВАНИ ВЪПРОСИ (ЧЗВ):
1. Микроблейдинг
- Болезнен ли е? Минимално болка, слага се обезболяващ крем. Повечето клиенти усещат само леко драскане.
- Трайност: Ефектът трае 1-2 години.
- Грижа: Без мокрене 24 часа, без слънце/солариум 1 седмица.
2. Микронидлинг 
- Подобрява текстура, пори, белези от акне, стимулира колаген. Дългосрочни резултати.
3. Миглопластика
- Избягвайте мокрене първите 24 часа.
4. Плазма пен
- Дългосрочни резултати. След процедура без сауна, солариум, слънце.
5. Ламиниране на мигли (Lash Lift) и вежди (Brow Lift)
- Включва боядисване и подхранване. Без мокрене първите 24 часа.
6. Пробиване на уши (вкл. за деца)
- Двустранно едновременно пробиване от двама козметици за по-бързо и безболезнено преживяване.
7. Премахване на перманентен грим

БЕЗОПАСНОСТ НА МАТЕРИАЛИТЕ:
Работи се със сертифицирани пигменти на PhiAcademy, без тежки метали (не стават червени/сини). Консумативите са стерилни и еднократни.

ПРАВИЛА:
- Пиши само на български.
- Бъди естествен, топъл и човечен. Отговаряй като човек, който работи на рецепция в студиото.
- НЕ повтаряй телефонния номер или имейла във всяко съобщение. Давай ги САМО ако клиентът изрично попита как да се запише, къде сте, или как да се свърже с вас.
- Не използвай шаблони от типа 'За повече информация се свържете с нас' в края на всяко изречение.
- Бъди кратък. Не давай дълги и изчерпателни отговори, освен ако не са нужни (2-3 изречения са напълно достатъчни).
- Ако зададат медицински въпрос или въпрос извън твоята компетенция, ги посъветвай да се консултират на място.
"
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

// Return only the text of the AI response back to the frontend
echo json_encode([
    'message' => $response_data['choices'][0]['message']['content']
]);
