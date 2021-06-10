

(async() => {	
	const result = await fetch("https://chrysalis-nodes.iota.org:443/api/v1/messages", {
		method: "POST",
		body: {
			"payload": {
				"type": 2,
				"index": "62657474696e61736f7361",
				"data": "7b22636f756e74223a312c2274696d65223a22323032312d30312d32302031323a30303a3030222c226d657373616765223a2253656e736f72204f6b6179227d",
			},
		}
	})
	const json = await result.json()
	console.log(json)
})();