<script>
    import { onMount, tick } from "svelte";
    import "prismjs/themes/prism-tomorrow.css";
    import Prism from "prismjs";
  
    let code = "";
  
    onMount(async () => {
      const res = await fetch("/opentrons_demo_script_full.py"); // Load script dynamically
      code = await res.text();
      await tick();
      Prism.highlightAll();
    });
  </script>

<a href="/opentrons_demo_script_full.py" download="opentrons_demo_script_full.py" class="flex justify-center mt-2 gap-2 items-center">
    <svg class="w-5 h-5" fill="#000000" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>download2</title> <path d="M27.624 20.955l-0.958 5.072h-21.332l-0.958-5.072h-2.385v8.062h28.018v-8.062h-2.385zM27.020 11.946h-7.022v-2.93h-7.994v2.93h-6.955l10.914 11.412 11.057-11.412zM19.997 3.982h-7.994v1.066h7.994v-1.066zM19.997 5.973h-7.994v2.038h7.994v-2.038z"></path> </g></svg>
    <button>Save</button>
</a>
  
<pre><code class="language-python">{code}</code></pre>
  