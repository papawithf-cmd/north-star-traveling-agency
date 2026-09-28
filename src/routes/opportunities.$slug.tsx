          <h1 className="font-display text-2xl font-bold">Opportunity not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This vacancy may have been closed or removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/opportunities">Browse opportunities</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const job = data;
  const images: { id: string; image_url: string; caption: string | null }[] = job.images.length
    ? job.images.map((img) => ({ ...img, image_url: mediaUrl(img.image_url) ?? img.image_url }))
    : [{ id: "fallback", image_url: categoryImage(job.category?.slug), caption: null }];
  const current = images[Math.min(active, images.length - 1)]!;



  return (
    <SiteLayout>
      <section className="hero-gradient text-navy-foreground">
        <div className="container-page py-12">
          <Link to="/opportunities" className="inline-flex items-center text-sm text-navy-foreground/70 hover:text-accent">
            <ChevronLeft className="mr-1 size-4" /> All opportunities
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.urgent ? <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge> : null}
            {job.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
            {job.verified ? (
              <Badge className="bg-success text-success-foreground">
                <BadgeCheck className="mr-1 size-3.5" /> Verified
              </Badge>
            ) : null}
            {job.category ? <Badge variant="outline" className="border-white/30 text-navy-foreground">{job.category.name}</Badge> : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold sm:text-4xl">{job.title}</h1>