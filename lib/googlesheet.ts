import { google } from "googleapis";

const key = "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQC6aUrU9p1bcqdy\nt/kJtwdlvWv8SXGVRn50jC0dgubtRJ9MYLE0150jHNF2101/Gf7SL+fNlR//XEqX\nTmn4HqL8FeGMh3xmP3OQdl79mzC3qHgTk1vjQZpN6r/aIHzGBZXwIXuRl0kbd1kG\ngqrG2ObScpNS7l3uGEh6Xa3VG2sQUAfT6kDUferlgEdtKwllk6DpYjL8pOBSstr3\np2PQXUMCzpETnaVyf/CHoaGC4JtwHLx6pPKAuwuIx0e2qVRO7Yfqu+ZVAFoxJqTp\nqQLwAyFuXAHQ8qm+8DlquCsPi7xiNKcKQLVeHd13q8+Gj8Ty6lcFDx5gOnZZb7q5\nQeeFmOv3AgMBAAECgf9W6S4xZaVBNI8CJFacsO/42tf9/xt12Qyukz6+uoA5aI5K\nje7sWL9GH6mJY49ixWCJVaf0jTcnDs5KdA30IObcfMTi9yOtY8NrYFdXL4Pir03e\n9zDN+rXkVOod/752ApJlmckVTxhGyEvwYbKG3r52X/UHENKV1E7R4v/ySZ9qVj5f\nwQboaCLzqpAxCSo31veEyY0RZE5yr41xVrnmZb4TCZ4FbyoEVtkR+FrxUmc9Uf17\n3XXK6jmGeRqJxHVRB9g5lB1Z1yAjwL/mxvswwX88FD4eSichZlE/zwx1llVnnghP\ntPBTNY22G5PEULZHIuwM2SFV7qFJNmMuaKHc0j0CgYEA6DUS2ZIv3sV7qABUeVgF\nACPsneMt74iubd1WWNIYphNZmwsBgTzOTNJWf0xIVBR59u100XmHqPFIh6omr0ws\nEOtEw49C7dJ6bhcZWlnSovFrkN/QXutVGXALGZ7XcjDcf+CwH5EHJU30aw9uZYOs\nlASXv/m9Q9oOubMWaliLZ70CgYEAzYL2tzCFt7UzKesEXxi7HowTiXXQhs+MnxPP\nEnKW4hb+vOqgCJW+feiL8dXZ34I5B4q9p4Hgdz+++LWddmkeRAvi39I+7d4+c+za\nrC32pDIqtNi0oY6NctkpIqL4JIW15NNpcR4fGXaVh1uhpdxW6uTFHVrde0KW3Y5Y\nAsx7c8MCgYAJ8vwzxke2y89Yi2sTJ+pO7zscKLe3I6wVmP4yIA5eT0XvlrEh0HEm\naXy7R5FxyM7Q/aubrhFZ87yf03KE4EajEvGHT4QWnIYSYXr8nAyiXqW1N2G+L2ce\nB+bx2hRxGBbag84IDDa6KnTmgWrBfrrOPMQjvZeWaKlo23uCYvjWIQKBgHlnI03G\niUej8EyT/CodVvTNtQDgK0ZoN18F+a6hKMb45JU/WTiZFUYV6Q380c86g2wUJsNc\ncvifHLaZuyJnKKz0BJtJ/UjRoD0lL2zFXk1TIW1iExrZNnAhHy7J7SLOJky+Iyzi\nqWaGagDjPZPYnTP33wXfVrVo+ex6GT3WBBu3AoGAU4Cr0m/GhaJxY05af0Q7Ugmx\nubGOQ3BuWu/8kfB1es2e33HgvyLDegLy7D7D/u2mKrHjygXGBGcL8SiHio07ZZl2\npRUVSvAw3iaPJ2yVvVKRXGhoC5JipyGCQiaLcwCV4Pttq7gIbIODhsIgBibUf/62\nZ3XhaUpX4ftX6Ozlkbs=\n-----END PRIVATE KEY-----\n";
const GOOGLE_CLIENT_EMAIL = "holden@lonelynet.iam.gserviceaccount.com";


const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_CLIENT_EMAIL,
    private_key: key.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheets = google.sheets({ version: "v4", auth });