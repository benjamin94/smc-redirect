export default {
  async fetch(request) {
    let url = new URL(request.url);

    // Define mappings of paths to external URLs
    const redirects = {
      "/memory-book": "https://sm6frtpg4mxbxc2bepxo25plue0zxzay.lambda-url.eu-west-2.on.aws",
      "/memory-lane": "https://zjaem2f2moe3sfa6gbprsboml40xgclw.lambda-url.eu-west-2.on.aws",
      "/digital-book": "https://fns5xcjyb7s3adhoq5uyy4h6sy0ibejs.lambda-url.eu-west-2.on.aws",
      "/digital-lane": "https://be5ubvhic7skxhddzkuz33q5xu0yfbgs.lambda-url.eu-west-2.on.aws"
    };

    if (redirects[url.pathname]) {
      let targetUrl = redirects[url.pathname];

      let response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers
      });

      // Return the response from the external server
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }

    // If no match, return a 404 response
    return new Response("Not found", { status: 404 });
  }
};
