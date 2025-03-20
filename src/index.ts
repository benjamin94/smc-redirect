// <docs-tag name="full-workflow-example">
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

type Env = {
	MY_WORKFLOW: Workflow;
};

type Params = {
	email: string;
	metadata: Record<string, string>;
};

const redirects: Record<string, string> = {
  "/memory-book": "https://sm6frtpg4mxbxc2bepxo25plue0zxzay.lambda-url.eu-west-2.on.aws",
  "/memory-lane": "https://zjaem2f2moe3sfa6gbprsboml40xgclw.lambda-url.eu-west-2.on.aws",
  "/digital-book": "https://fns5xcjyb7s3adhoq5uyy4h6sy0ibejs.lambda-url.eu-west-2.on.aws",
  "/digital-lane": "https://be5ubvhic7skxhddzkuz33q5xu0yfbgs.lambda-url.eu-west-2.on.aws"
};

// <docs-tag name="workflow-entrypoint">
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		const files = await step.do('my first step', async () => {
			return {
				inputParams: event,
				files: [
					'doc_7392_rev3.pdf',
					'report_x29_final.pdf',
					'memo_2024_05_12.pdf',
					'file_089_update.pdf',
					'proj_alpha_v2.pdf',
					'data_analysis_q2.pdf',
					'notes_meeting_52.pdf',
					'summary_fy24_draft.pdf',
				],
			};
		});

		const apiResponse = await step.do('some other step', async () => {
			let resp = await fetch('https://api.cloudflare.com/client/v4/ips');
			return await resp.json<any>();
		});

		await step.sleep('wait on something', '1 minute');

		await step.do(
			'make a call to write that could maybe, just might, fail',
			{
				retries: {
					limit: 5,
					delay: '5 second',
					backoff: 'exponential',
				},
				timeout: '15 minutes',
			},
			async () => {
				if (Math.random() > 0.5) {
					throw new Error('API call to $STORAGE_SYSTEM failed');
				}
			},
		);
	}
}
// </docs-tag name="workflow-entrypoint">

// <docs-tag name="workflows-fetch-handler">
export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		let url = new URL(req.url);

		if (url.pathname.startsWith('/favicon')) {
			return Response.json({}, { status: 404 });
		}

		// Check if the request matches any redirect path
		if (redirects[url.pathname]) {
			let targetUrl = redirects[url.pathname];
			let response = await fetch(targetUrl, {
				method: req.method,
				headers: req.headers
			});

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers
			});
		}

		// Get the status of an existing workflow instance
		let id = url.searchParams.get('instanceId');
		if (id) {
			let instance = await env.MY_WORKFLOW.get(id);
			return Response.json({
				status: await instance.status(),
			});
		}

		// Spawn a new instance and return the ID and status
		let instance = await env.MY_WORKFLOW.create();
		return Response.json({
			id: instance.id,
			details: await instance.status(),
		});
	},
};
// </docs-tag name="workflows-fetch-handler">
// </docs-tag name="full-workflow-example">
