# ModSecurity configuration

## On Traffic Distributor

The following procedure derives from https://www.virtuozzo.com/company/blog/modsecurity-nginx-waf/

1. Uncomment the `load_module modules/ngx_http_modsecurity_module.so;` line in `/etc/nginx/nginx.conf`
2. Add the following lines in the server of `/etc/nginx/conf.d/ssl.conf`:

```
modsecurity on;
modsecurity_rules_file /etc/nginx/conf.d/modsecurity/modsec_includes.conf;
```

3. If modsecurity is to log only, edit `/etc/nginx/conf.d/modsecurity/modsecurity.conf` and set the `SecRuleEngine` to `DetectionOnly`

4. `sudo service nginx reload`

## Customize the 403 error pages

Place the html page to display in the home of the Traffic distributor (`/var/lib/nginx/html/waf.html`). An error page is ready for use in the `mep` package.

Then, edit the `/etc/nginx/conf.d/ssl.conf` file by setting the following:

```
error_page 403 /waf.html;

location = /waf.html {
  root /var/lib/nginx/html;
}
```

Then `sudo service nginx reload`. To test the setup, try requesting an existing page with the following bit in the query: `?lang=fr%27%29+AND+1%3D1+UNION+ALL+SELECT+1%2CNULL%2C%27%3Cscript%3Ealert%28%5C%22XSS%5C%22%29%3C%2Fscript%3E%27%2Ctable_name+FROM+information_schema.tables+WHERE+2%3E1--%2F%2A%2A%2F%3B+EXEC+xp_cmdshell%28%27cat+..%2F..%2F..%2Fetc%2Fpasswd%27%29%23&oaq%5Bcategory%5D=saison-culturelle-de-lespace-roguet%27%29+AND+1%3D1+UNION+ALL+SELECT+1%2CNULL%2C%27%3Cscript%3Ealert%28%5C%22XSS%5C%22%29%3C%2Fscript%3E%27%2Ctable_name+FROM+information_schema.tables+WHERE+2%3E1--%2F%2A%2A%2F%3B+EXEC+xp_cmdshell%28%27cat+..%2F..%2F..%2Fetc%2Fpasswd%27%29%23`. This will show only if the `SecRulEngine` is `On` rather than in `DetectionOnly` mode

## Changes to ModSecurity OWASP default configuration:

Some changes must be made to avoid false-positives:

1. Add `application/reports+json` and `application/csp-report` to accepted formats. Edit crs-setup.conf and uncomment rule 900220, add `application/csp-report` and `application/reports+json` to accepted formats.

    SecAction \
     "id:900220,\
       phase:1,\
       nolog,\
       pass,\
       t:none,\
       setvar:'tx.allowed_request_content_type=application/x-www-form-urlencoded|multipart/form-data|text/xml|application/xml|application/soap+xml|application/x-amf|application/json|application/octet-stream|application/reports\+json|application/csp-report|text/plain'"

2. PATCH, DELETE and PUT methods should also be allowed. Edit `crs-setup.conf` and set `tx.allowed-methods` in the section `HTTP methods that a client is allowed to use.`:

    SecAction \
    "id:900200,\
      phase:1,\
      nolog,\
      pass,\
      t:none,\
      setvar:'tx.allowed_methods=GET HEAD POST OPTIONS PATCH DELETE PUT'"


3. Deactivate MULTIPART_UNMATCHED_BOUNDARY and MULTIPART_UNMATCHED_BOUNDARY in `modsecurity.conf` by commenting it. Not sure why it flags those, but the payloads are legitimate. Maybe has to do with the evaluated body being truncated.

4. Add the following at the end of `modsecurity.conf`:

```
# Restrict file extension - as we have routes looking like this: `/v2/agendas/71425737/members/email/celinelepagebroderiedart@gmail.com`
SecRuleRemoveById 920440
# Regular event creation flagged as XSS Attack (event https://openagenda.com/ville-de-lormont/events/conseil-and-accompagnement-numeriques-3790647)
SecRuleRemoveById 941100
# HTML can be posted on event create API on html additional fields. XSS is mitigated with CSP rules
SecRuleRemoveById 941160
# /reports posts are blocked when they inform us of CSP warnings, supposed to mitigate XSS
SecRuleRemoveById 941170
# Emails can be responded to, responses reach /incoming-emails and can be of HTML format
SecRuleRemoveById 921130
SecRuleRemoveById 941110
SecRuleRemoveById 941130
SecRuleRemoveById 941140
SecRuleRemoveById 941180
SecRuleRemoveById 941190
SecRuleRemoveById 941250
SecRuleRemoveById 941260
SecRuleRemoveById 932130

# Decoded payloads are handled by the event create API
SecRuleRemoveById 930110
# SQL injection detection considers the word "union" to be forbidden. But it is a word sometimes used in description fields
SecRuleRemoveById 942190
# SQL injection detection considers the word "having" to be forbidden. But it is a word sometimes used in description fields
SecRuleRemoveById 942230
# Conflicts with google authentication
SecRuleRemoveById 930120
# Erroneously detected UNIX command injection on this event https://openagenda.com/ingenie/events/aide-administrative-3886340 and this one https://openagenda.com/colomiers/events/rugby-colomiers-beziers-9060638 (description field)
SecRuleRemoveById 932100
SecRuleRemoveById 932110
# False positive on image file name with accent and spaces
SecRuleRemoveById 920120
# False positive on tge following GET: /v2/agendas/49534310/events?relative%5B0%5D=passed&relative%5B1%5D=upcoming&relative%5B2%5D=current&longDescriptionFormat=HTMLWithEmbeds&slug=5-jours-en-colo--5196664&detailed=1&key=[PUBLIC_KEY]&size=20&from=0
SecRuleRemoveById 942100
# Multipart strict validation does not play well with event contribute form
SecRuleRemoveById 920140
# Many users are making get calls with bodies (usually empty ones). These are ignored.
SecRuleRemoveById 920170
# Blocks Sentry /monit calls
SecRuleRemoveById 920340
# Blocks contributions with files
SecRuleRemoveById 930100
# False positive on /festival-culture-bar-bars-2023/events/cora-8896091 where "ORA" is in the title. Also on /events/visita-comentada-de-la-colegiata-de-nuestra-senora-6841506
SecRuleRemoveById 951120
# Unix command injection - False positive on https://openagenda.com/bibliotheques-de-toulouse/events/antoine-guilloppe-20-ans-dillustrations-
SecRuleRemoveById 932105
SecRuleRemoveById 932150
# False positive on https://openagenda.com/epitech/events/semaines-du-hub-workshop-sql
SecRuleRemoveById 951220
# False positive on conversation - https://openagenda.com/home/inbox/conversation/85667
SecRuleRemoveById 931120
# False positive on Semaine de l'industrie posted event and not relevent (Injection for MS Windows)
SecRuleRemoveById 932115
```