#!/usr/bin/perl -w
#!/usr/bin/speedy -w
package SwishAPISearch;
use strict;

######################################################################
# Skeleton CGI script for searching a Swsih-e index with SWISH::API.
# see below for documenation or run "perldoc search.cgi"
#
# Copyright 2003, 2004 Bill Moseley - All rights reserved.
#
# $Id: search.cgi.in,v 1.8 2005/06/09 18:58:24 augur Exp $
#
#######################################################################

use vars '$VERSION';
$VERSION = '1.1';


# This needs to be set to where Swish-e installed the Perl modules 

# This is set to where Swish-e's "make install" installed the helper modules.
use lib ( '/usr/lib/swish-e/perl' );

#------------------- Modules --------------------------------------
use SWISH::API;             # for searching the index file
use SWISH::ParseQuery;      # Parses the query string
use SWISH::PhraseHighlight; # for highlighting
use CGI;                    # provides a param() method -- could use Apache::Request, for example.
use HTML::FillInForm;       # makes the form elements sticky
use Template;               # Template-Toolkit: http://tt2.org or see http://search.cpan.org




#-------------------- Defaults/Parameters --------------------------
# Default config settings
#
# prop_to_meta defines the metas that are used for searching the text displayed
# by the give property.  This is only needed when the property name and metaname
# do not match up.
# prop_to_meta => {
#   swishdescription => [ qw/ swishdefault / ],
#   swishtitle => [ qw/ swishdefault swishtitle / ],
# },
# Which says when displaying the swishdescription property use the search words
# from the swishdefault metaname (if any) for searching.  And when displaying the
# swishtitle property use words form both swishdefault and swishtitle (when
# indexing HTML swish indexes the <title> along with the body under the swishdefault
# metaname).


use vars qw/ %config %highlight_settings %site_cache /;

%config = (
    INCLUDE_PATH => [ '/usr/share/swish-e/templates' ],       # template path
    index        => 'index.swish-e',             # path to index file
    page_size    => 10,                          # numbe of results/page
    title        => 'Swish Example Search Page',
    template     => 'search.tt',
    prop_to_meta => {
        swishdescription => [ qw/ swishdefault / ],
        swishtitle => [ qw/ swishdefault swishtitle / ],
    },
);


# Params used for the highlighting modules

%highlight_settings = (
    show_words      => 8,  # number of words to show
    occurrences     => 5,   # number of words to show
    max_words       => 100, # max number of words to show if not highlighted words found
    highlight_on    => '<span class="highlight">',
    highlight_off   => '</span>',
);

#--------------------- Code ----------------------------------------
# Entry point for normal CGI programs.
# Should be object creation

unless ( $ENV{MOD_PERL} ) {

    $site_cache{_singleton} ||= {
        config  => \%config,  # no deep copy
    };

    process_request( $site_cache{_singleton}  );
}


# Entry point for mod_perl
sub handler {
    my $r = shift;

    require Storable;

    my $id = $r->dir_config('site_id') || '_singleton';

    unless ( $site_cache{ $id } ) {

        $site_cache{ $id } ||= {
            config => Storable::dclone( \%config ), # deep copy
        };

        my $config =  $site_cache{ $id }{config};

        for ( qw/  index page_size title temmplate / ) {
            my $value = $r->dir_config( $_ );
            $config->{$_} = $value if defined $value;
        }

        if ( my $template_path = $r->dir_config('template_path') ) {
            unshift @{$config->{INCLUDE_PATH}}, $template_path;
        }
    }

    process_request( $site_cache{ $id } );

    return Apache::Constants::OK();
}



#-------------------------------------------------------------------
# Process a request
# Passes in a config hash
#-------------------------------------------------------------------


sub process_request {
    my ( $instance ) = @_;  # bad name since it persists between requests

    my $cgi = CGI->new;  # could also be Apache::Request or other fast access to CGI params

    my $config = $instance->{config};

    my $request = {
        cgi         => $cgi,
        myself      => $cgi->url(-path=>1),
        query       => $cgi->param('query') || undef,
        metaname    => $cgi->param('metaname') || undef,
        page        => $cgi->param('page') || 1,
        pagesize    => $cgi->param('size') || $config->{page_size} || 10,
        pid         => $$,
    };

    $instance->{request} = $request;


    # If a query was passed in then run the search
    if ( $request->{query} ) {

        #  Limit by metaname
        $request->{swish_query} = $request->{metaname}
            ? "$request->{metaname}=( $request->{query} )"
            : $request->{query};

        $instance->{result} = run_query( $instance );
    }


    # Generate output
    my $output = generate_view( $instance );


    # Run output through HTML::FillInForm to make form elements sticky

    my $fill_in_object = HTML::FillInForm->new;
    print $cgi->header;
    print $fill_in_object->fill( scalarref => $output, fobject => $cgi );

    delete $instance->{request};  # clean up the request
    delete $instance->{result};
}




# Subroutine to run the Swish query.  Returns a hash reference.
# A better design might be to return an object with methods for accessing the data.

sub run_query {
    my ( $instance ) = @_;

    my $config = $instance->{config};
    my $request = $instance->{request};

    my $page = $request->{page};
    my $pagesize = $request->{pagesize};

    $page = 1 unless defined $page  && $page =~ /^\d+$/;
    $pagesize = 15 unless defined $pagesize && $pagesize =~ /^\d+$/ && $pagesize > 0 && $pagesize < 50; 


    # Create the swish object if not cached.
    # Also read in the header data and initialize the highlighting module

    my $swish = $instance->{swish};
    my $msg;

    if ( ! $swish ) {
        $swish = SWISH::API->new( $config->{index} );
        die "Failed to create SWISH::API object" unless $swish;
        return { message => check_swish_error( $swish ) } if $swish->Error;

        $instance->{swish} = $swish;  # cache for next request or for template

        # Note, this only works with a single index file
        my %headers = map { lc($_) => ($swish->HeaderValue( $config->{index}, $_ )||'') } $swish->HeaderNames;

        # and cache the highlighting object
        # Note if searching more than one index with differing settings then need one
        # highlight object for each index
        $instance->{highlight_object} = SWISH::PhraseHighlight->new( \%highlight_settings, \%headers, { swish => $swish } );
    }


    # Run the search.  See SWISH::API for more options (like sorting)

    my $results = $swish->Query( $request->{swish_query} );

    return { message => check_swish_error( $swish ) } if $swish->Error;
    return { hits  => 0 } unless $results->Hits;


    # Seek to the first record of the page requested

    $results->SeekResult( ($page-1) * $pagesize );

    return { message => check_swish_error( $swish ) } if $swish->Error;

    my @records;
    my $result;
    my $cnt = $pagesize;



    # Store the result objects in an array
    push @records, $result while $cnt-- && ($result = $results->NextResult);


    # Return the results structure

    my %result = (
        results_obj => $results,
        results     => \@records,
        hits        => $results->Hits,
        shown       => scalar @records,
        page        => $page,
        start       => ($page-1) * $pagesize,
    );




    $result{prev} = $page-1 if $page > 1;
    $result{next} = $page+1 if $result{start} + $pagesize < $result{hits};

    return \%result;
}


# Return swish error messages

sub check_swish_error {
    my $swish = shift;

    return unless $swish->Error;
    my $message = join( ' ', $swish->ErrorString, $swish->LastErrorMsg );
    die "$message\n" if $swish->CriticalError;
    return $message;

}


# This generates the output from the templates

sub generate_view{
    my ( $instance ) = @_;

    my $config = $instance->{config};
    my $result = $instance->{result};

    $instance->{template_object} ||= Template->new( INCLUDE_PATH => $config->{INCLUDE_PATH} ) 
        || die $Template::ERROR, "\n";

    my $template = $instance->{template_object};


    # Create a highlight filter if any results
    create_highlight_filter( $instance ) if $result->{hits};


    my $template_output;
    $template->process( $config->{template}, $instance, \$template_output ) || die $template->error;

    return \$template_output;

}

# Creates a filter for highlighting search terms

sub create_highlight_filter {
    my ( $instance ) = @_;

    my $result = $instance->{result};
    my $config = $instance->{config};


    # Now create a filter 'highlight' for use in the template to highlight terms
    # Usage requires passing in the *metaname* associated with the property
    # that's being highlighted -- this allows the program to know what
    # search words to use in highlighting 

    my $parsed_query = parse_query( join ' ', $result->{results_obj}->ParsedWords( $config->{index} ) );




    # save for Data::Dumper
    $result->{parsed_query} = $parsed_query;

    # Now create the Template-Toolkit "filter"

    $instance->{template_object}->context->define_filter( 'highlight',
        sub {
            my ( $context,  $property_name, $result_object ) = @_;

            my @phrases;

            # Do we need to map the property name to a metaname?
            my $metas = $config->{prop_to_meta}{$property_name} || [ $property_name ];


            # Now collect the query words used, if any
            # Might also check for duplicate phrases for a small optimization

            for ( @$metas ) {
                push @phrases,  @{$parsed_query->{$_}} if $parsed_query->{$_};
            }

            # Longest phrases first
            @phrases = sort { @$b <=> @$a } @phrases;


            # Here's the filter factory
            return sub {
                my $text = shift;
                $instance->{highlight_object}->highlight( \$text, \@phrases, $property_name, $result_object );
                return $text;
            }
        }, 

        1,
    );
}
__END__

=head1 NAME

search.cgi -- Example Perl program for searching with Swish-e and SWISH::API

=head1 DESCRIPTION

This is a very simple program that shows how to use the SWISH::API module
in a CGI script or mod_perl handler using Template-Toolkit to generate
output.  This program is intended for programmers that want to create a custom
search script.

Unlike F<swish.cgi> this script does not have many features, and provides no
external configuration (with the execption of a few config options under
mod_perl).  So don't ask why it doesn't do something.  The point is that this
script is used as a starting point that YOU customize.

=head1 REQUIREMENTS

You must have swish-e and the SWISH::API module installed.  See the README
and INSTALL documents in the swish-e distribution.  As of this writing SWISH::API
is part of the swish-e distribution, but in the future may be provided as a separate
package (provided on the CPAN).  In either case SWISH::API is a separate installation
procedure from installing swish-e.  The Storable module is also required if using mod_perl.

This program does require that some modules are installed from CPAN.
You will need Template-Toolkit and HTML::FillInForm (which depends on HTML::Parser).
How those are installed depends on your computer's packaging system.

You will need a web server, obviously.  The discussion below assumes Apache is used.
If you are using MS IIS take note that IIS works differently in a number of ways.

=head1 OVERVIEW

The F<search.cgi> script and related templates are installed when swish-e is installed.
F<search.cgi> is installed in $prefix/lib/swish-e/ and templates are installed
in $prefix/share/swish-e/templates/.  $prefix is /usr/local by default
but can be changed when running the swish-e F<configure> script.  Upon
installation F<search.cgi> is updated with correct paths to your perl binary and

When running as a CGI script F<search.cgi> is copied or symlinked to the location
of your CGI scripts (or any directory that allows CGI scripts).  By default,
the F<search.cgi> script looks for the index F<index.swish-e> in the current
directory (that's what the web server considers the current directory).  On Apache
running mod-cgi that's the same place as the script.  On IIS it's not.  If your
index is elsewhere you will need to modify the script.

The script works by parsing the query, calling SWISH::API to run the actual search, then
calls Template-Toolkit to generate the ouput.

The script calls the F<search.tt> template.  This template generates the query
form and the search results.  The F<search.tt> template uses a
Template-Toolkit "WRAPPER" function to wrap the search form and results in your
site's design.   This design is in the F<page_layout> template.   The idea is
if you use Template-Toolkit to manage your entire site then your entire site
would be formatted by the same F<page_layout> template.  The F<page_layout> template
calls two other templates F<common_header> and F<common_footer> to generate a common
header and footer for the site.  Those are just demonstrating Template-Toolkit's
features.

The F<page_layout> page only defines the basic structure of the site.  The true
design of the site is managed by style sheets.  F<style.css> defines the basic
layout and F<markup.css> sets fonts and colors.  

Note: these style sheets are included directly in the output of the CGI script.
In production the style sheets would be stored as separate style
sheet files and imported by the browser instead of directly included in the
search results page.

See the section MOD_PERL below for more on templates.

Highlighting of search terms is provided by the SWISH::PhraseHighlight module.
That is a very slow module, so you may wish to disable it if you expect a lot
of traffic.


=head1 INSTALLATION EXAMPLE

Enough talking, sometimes it's nice to see a complete example.  Below swish-e
is installed in the default location (/usr/local).  The "$" is a normal user
prompt, where "#" is a root prompt.  Use ./configure --prefix to install in another
location (e.g. if you do not have root access).

Download and install swish-e

    $ wget -q http://swish-e.org/Download/latest.tar.gz
    $ tar zxf latest.tar.gz
    $ cd swish-e-2.x.x
    $ (./configure && make) >/dev/null
    $ make check
    $ su
    # make install
    # exit

Install SWISH::API

    $ cd perl
    $ perl Makefile.PL && make && make test
    $ su
    # make install
    $ exit

Install requried Perl modules.  You can install via RPMs, Debs or directly from the CPAN
or by using the CPAN shell.

    # su
    # perl -MCPAN -e 'install Template'
    # perl -MCPAN -e 'install HTML::FillInForm'
    # exit

Now setup the script in someplace that allows CGI scripts.

    $ cd $HOME/apache
    $ ln -s /usr/local/lib/swish-e/search.cgi .
    $ cat .htaccess
    deny from all
    <files search.cgi>
        allow from all
        SetHandler cgi-script
        Options +ExecCGI
    </files>

Create an index

    $ cat swish.config
    IndexOnly .htm .html
    DefaultContents HTML*
    StoreDescription HTML* <body>
    metanames swishtitle swishdocpath

    $ swish-e -c swish.config -i /usr/share/doc/apache-doc/manual

Test the index and the CGI script:

    $ swish-e -w apache -m1 | grep hits
    # Number of hits: 152

    $ lynx -dump http://localhost/apache/search.cgi?query=apache | grep hits
        Showing page 1 (1 - 10 of 152 hits) [3]Next
              'hits' => 152,

Now, the above isn't very helpful because the Apache documentation indexed is not
in the web space.  You would likely index content available on your web site.

=head1 Using with SpeedyCGI

Perl CGI script must be compiled for each request.  SpeedyCGI is a tool to speed up
scripts by running them persistently.  To run F<search.cgi> with SpeedyCGI install
the program (you can Google, right?) and then change the first line of F<search.cgi>
to run the F<speedy> program.

For example:

    #!/usr/bin/speedy -w


=head1 Using with MOD_PERL

This script can be run directly as a mod_perl handler, and the same code can be used
to run multiple sites by using separate Location directives and passing in a "site id."
The script caches in memory different configurations based on this site id.

Below is a complete httpd.conf file.  It requires an Apache httpd that has
mod_perl compiled in statically.  It runs mod_perl on a high port (port 5000)
listening to all interfaces.  

For testing I put this config file in a directory along with F<search.cgi>, but
that's just done to make the example simple (i.e. so I don't have to show any
absolute paths).  Normally the httpd.conf and the swish.cgi "module" would be
in separate locations.


    # httpd.conf -- test file for search.cgi as mod_perl handler

    <ifModule mod_so.c>
        LoadModule mime_module /usr/lib/apache/1.3/mod_mime.so
    </IfModule>

    ErrorLog swish_error_log
    PidFile swish_httpd.pid

    Listen *:5000

    <perl>
        push @PerlSetVar, [
            index  => Apache->server_root_relative( 'index.swish-e'),
        ];
        $DocumentRoot =  Apache->server_root_relative;
        require "search.cgi";
    </perl>

    NameVirtualHost *:5000
    <VirtualHost *:5000>

        ServerName localhost

        <Location /search>
            SetHandler  perl-script
            PerlHandler SwishAPISearch
        </Location>

        <Location /othersite>
            SetHandler perl-script
            PerlHandler SwishAPISearch
            # Define this site
            PerlSetVar  site_id othersite
            PerlSetVar  title "Some other Site"
        </Location>

    </VirtualHost>

The server is started using this command:

    $ /usr/sbin/apache-perl -d $(pwd) -f $(pwd)/httpd.conf

which says to use the current directory as the ServerRoot.
(See comments below.)  Stop the server like:

    $ kill `cat swish_httpd.pid`

Then access either:

    http://localhost:5000/search
    http://localhost:5000/othersite

A few Notes:

I like test configurations to not care where things are located.  Thus, the
above httpd.conf does a few tricks in the "Perl Section" shown.

First, mod_perl, unlike CGI, doesn't set the working directory.  So, the index file
name must be absolute.  This is accomplished by a PerlSetVar entry building
the index file name from the ServerRoot.

Second, the DocumentRoot is set to the same as the ServerRoot.  The DocumentRoot
needs to be set so search.cgi can figure out the path to the script (for
creating next and previous links).

Third, the script is loaded by a C<require> statement.  This works only because
the current directory "." is in Perl's @INC path at Apache start up time and
F<search.cgi> is also in the current directory.  Normally, set PERL5LIB
on server startup or use a "use lib" line in your startup.pl file to point to
the location of search.cgi.

The "PerlSetVar" lines pass config information into the script.  Note that they can
be set globally or specific to a given Location.

The following config options are currently available:

=over 4

=item site_id

The site_id options allow caching of configurations on a per-site basis.
It's overkill in this example, but normally you might have expensive configuration
processes that you might want to do only once.  But, since there is caching by this id
it's a good id to set a site_id if using more than one Location directive.

=item index

This specifies the index file to use.  The index file needs to be absolute
as discussed above.  Example:

    PerlSetVar index /usr/share/swish/site.index

=item title

This options sets the title that's passed into the template.

=item template

Sets the file name of the template use to generate the form.  This might be useful
if you want an "advanced" form, for example.

=item template_path

This can be used to update the path where templates are searched.  Useful if you wish
to override templates.

=item page_size

This allow changing the default number of results shown per page.

=back


=head1 SUPPORT

Not much support is provided.  But what support is provided is ONLY provided via
the Swish-e discussion list.

    http://swish-e.org/


=head1 AUTHOR

Bill Moseley

=head1 LICENSE

Copyright 2003, 2004 Bill Moseley.  All rights reserved.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

=head1 SEE ALSO

SWISH::API,  Template, HTML::FillInForm


