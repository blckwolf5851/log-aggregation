from scipy import optimize
from scipy.stats import poisson, norm
import numpy as np
import math

from scipy import special
from scipy.special import entr, logsumexp, betaln, gammaln as gamln

# l=100
# t=120 # if t is too large, the convergence will fail
# imprecision = 0.05

def poi_coef(x, mu):
    return np.exp(special.xlogy(x, mu) - gamln(x + 1))


def get_num_batch(mean_occurance, threshold, precision=0.9, var=50):
    # TODO compute in log terms to avoid numerical error
    l=mean_occurance
    t=threshold # if t is too large, the convergence will fail, because it only need very little batch
    imprecision = 1-precision
    eps=1e-4
    def f(x):
        if l < 22: # infrequent event
            val = poisson.cdf(t, l/x) * (1-np.exp(-l/x)) * (poisson.cdf(t//2, l*(x-1)/x))-imprecision
        else: # frequent event
            scal = 5
            mean1 = l
            std1 = np.sqrt(var/x**2) #np.sqrt(mean1)/scal
            mean2 = l*(x-1)/x
            std2 = np.sqrt(var*((x-1)/x)**2)#np.sqrt(mean2)/scal

            term1 = norm.cdf((t-mean1)/std1)
            term2 = (1-norm.cdf((t/10-mean1)/std1))
            term3 = (norm.cdf(t//2-mean2)/std2)
            val = term1 * term2 * term3 - imprecision
            # print(term1)
            # print(term2)
            # print(term3)
            print(x, val)
        return val
    sol = optimize.root_scalar(f, bracket=[2, 2000], method='brentq', rtol=0.03, xtol=0.03)
    # sol = optimize.root_scalar(f, x0=l, fprime=df, bracket=[2, 1500], method='newton', rtol=0.03, xtol=0.03)
    # print(sol)
    if sol.converged:
        root = math.ceil(sol.root)
        return 1500 if root > 1500 else 3 if root < 3 else root
    else:
        return 500

if __name__ == "__main__":
    root = get_num_batch(18, 24, 0.90)
    print(root)


