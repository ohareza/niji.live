terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "ohareza"

    workspaces {
      name = "nijilive"
    }
  }
}