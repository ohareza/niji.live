locals {
  domain = "niji.live"
}

variable "cloudflare_email" {}

variable "cloudflare_api_key" {}

variable "cloudflare_account_id" {}

provider "cloudflare" {
  version    = "~> 2.0"
  email      = var.cloudflare_email
  api_key    = var.cloudflare_api_key
  account_id = var.cloudflare_account_id
}

resource "cloudflare_zone" "this" {
  zone = local.domain
}

resource "cloudflare_zone_settings_override" "this" {
  zone_id = cloudflare_zone.this.id
  settings {
    security_level           = "essentially_off"
    automatic_https_rewrites = "on"
    ssl                      = "strict"
    http2                    = "on"
    http3                    = "on"
    zero_rtt                 = "on"
    min_tls_version          = "1.3"
    tls_1_3                  = "zrt"
    security_header {
      enabled            = true
      preload            = true
      max_age            = 31536000
      include_subdomains = true
      nosniff            = true
    }
  }
}

resource "cloudflare_record" "this" {
  zone_id = cloudflare_zone.this.id
  name    = "@"
  value   = "1.1.1.1"
  type    = "A"
  proxied = true
}

resource "cloudflare_page_rule" "this" {
  zone_id  = cloudflare_zone.this.id
  target   = "${local.domain}/*"
  priority = 1

  actions {
    always_use_https         = true
    automatic_https_rewrites = "on"
  }
}

resource "cloudflare_worker_route" "this" {
  zone_id     = cloudflare_zone.this.id
  pattern     = "${local.domain}/*"
  script_name = cloudflare_worker_script.this.name
}

resource "cloudflare_worker_route" "this" {
  zone_id     = cloudflare_zone.this.id
  pattern     = "${local.domain}/schedule"
  script_name = cloudflare_worker_script.schedule.name
}

resource "cloudflare_worker_script" "this" {
  name    = "niji-live"
  content = file("index.js")
}

resource "cloudflare_worker_script" "schedule" {
  name    = "niji-live-schedule"
  content = file("schedule.js")
}
