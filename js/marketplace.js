// Marketplace Logic and OpenRouter API Integration

const API_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free"; // Free fast model on OpenRouter
const LOADING_DURATION = 5000; // 5 seconds

// Tool System Prompts
const toolPrompts = {
  tool1: "You are an expert brand strategist. Generate 20 premium, highly brandable, and viral product names for the following product idea. Format as a neat list.",
  tool2: "You are an SEO expert. Generate SEO optimized product titles for Etsy, Gumroad, Amazon KDP, Shopify, and Pinterest (20 titles per platform) for the following product name.",
  tool3: "You are an expert copywriter. Write highly engaging, conversion-optimized product descriptions for Etsy, Gumroad, Amazon KDP, and Shopify for the following product name.",
  tool4: "You are an SEO analyst. Provide a comprehensive list of high search volume keywords, long-tail keywords, and platform-specific keywords (Etsy, Pinterest, Amazon) for the following product.",
  tool5: "You are a pricing strategist. Suggest optimal pricing strategies and exact price points for Etsy, Gumroad, Shopify, and a Bundle option for the following product. Include psychological pricing rationale.",
  tool6: "You are a market researcher. Detail the target audience for the following product, including detailed buyer personas, interests, pain points, and demographics.",
  tool7: "You are an e-commerce expert. Suggest bundle ideas, related products, and upsell opportunities for the following product to maximize Average Order Value (AOV).",
  tool8: "You are a competitive intelligence analyst. Provide competitor research for the following product: suggest competitor titles, keywords, and marketing angles.",
  tool9: "You are a graphic designer. Suggest Canva design ideas for the following product including color palettes (with hex codes), font pairings, cover layout ideas, and visual aesthetics.",
  tool10: "You are a Pinterest marketing expert. Generate a complete Pinterest pack for the following product: 20 Pin Titles, 10 Pin Descriptions, 30 Hashtags, and 5 Viral Hooks.",
  tool11: "You are a social media manager. Generate viral social media content for the following product: 5 TikTok Hooks, 5 Instagram Captions, 3 Facebook Posts, 5 X (Twitter) Posts, and 2 Professional LinkedIn Posts.",
  tool12: "You are an email marketing specialist. Write an email marketing sequence for the following product: 1 Welcome Email, 1 Sales/Launch Email, 1 Follow-up Email, and 1 Abandoned Cart Email.",
  tool13: "You are an e-commerce financial analyst. Calculate estimated fees (Etsy, Gumroad, Shopify) and potential profit margins for a product with the following selling price (assume standard processing fees). Format neatly.",
  tool14: "You are an e-commerce trend analyst. Analyze the viral potential of the following product name/idea. Provide a Viral Score (1-100) for Etsy, Pinterest, Gumroad, and Shopify, along with a brief explanation for each score.",
  tool15: "You are a world-class business consultant and AI agent. Generate a FULL BUSINESS PACK for the following product idea. Include: Product Names, SEO Titles, Descriptions, Keywords, Pricing, Bundle Ideas, Audience Profile, Etsy Pack, Gumroad Pack, KDP Pack, Shopify Pack, Pinterest Pack, Social Media Pack, Email Marketing Pack, and a Viral Score. Format this extremely cleanly with clear headings."
};

const flagshipLoadingMessages = [
  "Analyzing Product...",
  "Researching Keywords...",
  "Creating Marketplace Assets...",
  "Generating Marketing Copy...",
  "Finalizing Results..."
];

// Toast Notification
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✅</span> ${message}`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

// Generate Function
async function handleGenerate(toolId) {
  const inputEl = document.getElementById(`input_${toolId}`);
  const btnEl = document.getElementById(`btn_${toolId}`);
  const loadingEl = document.getElementById(`loading_${toolId}`);
  const resultAreaEl = document.getElementById(`result_area_${toolId}`);
  const resultContentEl = document.getElementById(`result_content_${toolId}`);
  const loadingTextEl = document.getElementById(`loading_text_${toolId}`);
  
  const inputValue = inputEl.value.trim();
  if (!inputValue) {
    alert("Please enter a valid input.");
    return;
  }

  const apiKey = localStorage.getItem('openrouter_api_key');
  if (!apiKey) {
    alert("OpenRouter API Key is missing! Please go to the Admin Dashboard > API Settings to save your key.");
    return;
  }

  // Update UI state
  btnEl.disabled = true;
  resultAreaEl.style.display = 'none';
  loadingEl.style.display = 'flex';
  
  // Flagship message animation
  let messageInterval;
  if (toolId === 'tool15') {
    let msgIndex = 0;
    loadingTextEl.innerText = flagshipLoadingMessages[0];
    messageInterval = setInterval(() => {
      msgIndex++;
      if(msgIndex < flagshipLoadingMessages.length) {
        loadingTextEl.innerText = flagshipLoadingMessages[msgIndex];
      }
    }, 1000);
  }

  const prompt = toolPrompts[toolId] + "\n\nInput: " + inputValue;

  // Start both the API call and the 5-second minimum timer
  const timerPromise = new Promise(resolve => setTimeout(resolve, LOADING_DURATION));
  
  let apiResult = "An error occurred during generation.";
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href, // Required by OpenRouter
        "X-Title": "NexusAI Marketplace Suite", // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "API Error");
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      apiResult = data.choices[0].message.content;
    }
  } catch (error) {
    console.error(error);
    apiResult = `Error: ${error.message}\n\nPlease check your OpenRouter API key in the Admin settings.`;
  }

  // Wait for the 5-second timer to complete even if API is faster
  await timerPromise;

  // Cleanup & Display
  if (messageInterval) clearInterval(messageInterval);
  loadingEl.style.display = 'none';
  btnEl.disabled = false;
  
  resultContentEl.innerText = apiResult;
  resultAreaEl.style.display = 'block';
}

// Copy to Clipboard
function copyResult(toolId) {
  const content = document.getElementById(`result_content_${toolId}`).innerText;
  navigator.clipboard.writeText(content).then(() => {
    showToast("Copied Successfully");
  }).catch(err => {
    alert("Failed to copy text.");
  });
}

// Export to TXT
function exportTxt(toolId) {
  const content = document.getElementById(`result_content_${toolId}`).innerText;
  const toolName = document.querySelector(`#btn_${toolId}`).closest('.ai-tool-card').querySelector('.tool-title').innerText;
  const fileName = `${toolName.replace(/\s+/g, '_').toLowerCase()}_result.txt`;
  
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  
  showToast("Exported to TXT");
}
